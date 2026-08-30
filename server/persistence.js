// Camada de persistência dos snapshots. Prioriza o PostgreSQL (tabelas criadas
// pela migração). Se o banco não estiver disponível, cai para arquivos JSON em
// disco — garantindo que o app nunca quebre por falta de banco.

import { mkdir, readdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool, isDbAvailable } from "./db.js";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const DISK_SNAP_DIR = path.join(__dir, "..", "data", "snapshots");

// devolve o file path para um dia
const diskFile = (day) => path.join(DISK_SNAP_DIR, `${day}.json`);

export const todayKey = () => new Date().toISOString().slice(0, 10);

// ---------- backend: PostgreSQL ----------
async function pgSaveSnapshot(snap) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `SELECT 1 FROM rank_snapshots WHERE source=$1 AND captured_at::date = $2::date LIMIT 1`,
      ["steam", snap.day]
    );
    if (rows.length) {
      await client.query("ROLLBACK");
      return false; // já existe snapshot do dia
    }
    for (const e of snap.entries) {
      // entries vêm com steamRank (do coletor); mapeamos para position.
      const rank = e.rank ?? e.steamRank ?? null;
      if (rank == null) continue;
      await client.query(
        `INSERT INTO rank_snapshots
           (source, game_slug, position, players, league_size, captured_at)
         VALUES ($1,$2,$3,$4,$5, now())`,
        ["steam", e.slug, rank, e.players ?? null, snap.league]
      );
    }
    await client.query("COMMIT");
    return true;
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

async function pgLoadSnapshots(days = 8) {
  const cutoff = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const { rows } = await pool.query(
    `SELECT game_slug, position, players, captured_at::date AS day
       FROM rank_snapshots
      WHERE source='steam' AND captured_at::date >= $1::date
      ORDER BY captured_at ASC`,
    [cutoff]
  );
  // agrupa por dia
  const byDay = new Map();
  for (const r of rows) {
    const rec = byDay.get(r.day) || { day: r.day, entries: [] };
    rec.entries.push({ slug: r.game_slug, rank: r.position, players: r.players });
    byDay.set(r.day, rec);
  }
  return [...byDay.values()];
}

// ---------- backend: disco (fallback) ----------
async function diskSaveSnapshot(snap) {
  try {
    await mkdir(DISK_SNAP_DIR, { recursive: true });
    const raw = await readFile(diskFile(snap.day), "utf8").catch(() => null);
    if (raw) return false; // já existe
    await writeFile(diskFile(snap.day), JSON.stringify(snap));
    return true;
  } catch {
    return false;
  }
}

async function diskLoadSnapshots(days = 8) {
  let files = [];
  try {
    files = (await readdir(DISK_SNAP_DIR)).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
  } catch {
    return [];
  }
  files = files.slice(-days);
  const out = [];
  for (const f of files) {
    try {
      out.push(JSON.parse(await readFile(path.join(DISK_SNAP_DIR, f), "utf8")));
    } catch {
      /* ignore */
    }
  }
  return out;
}

// ---------- API pública ----------
export async function saveSnapshot(entries, league) {
  const snap = { day: todayKey(), league, source: "steam", entries };
  if (await isDbAvailable()) {
    try {
      return await pgSaveSnapshot(snap);
    } catch (e) {
      // banco falhou no meio → tenta disco, mas não quebra
      console.error("[steamtwo] pg snapshot falhou, usando disco:", e.message);
      return diskSaveSnapshot(snap);
    }
  }
  return diskSaveSnapshot(snap);
}

export async function loadSnapshots(days = 8) {
  if (await isDbAvailable()) {
    try {
      const pg = await pgLoadSnapshots(days);
      if (pg.length) return pg;
    } catch (e) {
      console.error("[steamtwo] pg load falhou, usando disco:", e.message);
    }
  }
  return diskLoadSnapshots(days);
}

export async function hasSnapshot(day = todayKey()) {
  // Com banco ativo, o Postgres é a fonte da verdade (ignora disco duplicado).
  if (await isDbAvailable()) {
    try {
      const { rows } = await pool.query(
        `SELECT 1 FROM rank_snapshots WHERE source='steam' AND captured_at::date=$1::date LIMIT 1`,
        [day]
      );
      return rows.length > 0;
    } catch {
      /* cai pro disco */
    }
  }
  try {
    await access(diskFile(day));
    return true;
  } catch {
    return false;
  }
}

export { DISK_SNAP_DIR };
