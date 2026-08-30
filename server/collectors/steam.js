// Coletor real da Steam. Fontes:
//  - top de jogadores simultâneos: https://api.steampowered.com/ISteamChartsService/GetGamesByConcurrentPlayers/v1/
//  - metadados (nome, gênero): https://store.steampowered.com/api/appdetails
//  - jogadores de um app específico: https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=
//
// Todas públicas, sem chave. As chamadas são armazenadas em cache em disco
// para evitar refazer centenas de requisições a cada carga da página.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dir, "..", "..", "data", "steam-cache");

const SERIES_FALLBACK = "Autres";

export const TOP_LEAGUE = 100; // tamanho da lista pública do top Steam

const META_TTL = 1000 * 60 * 60 * 12; // 12h para metadados de nomes/gêneros

async function readCache(file) {
  try {
    const raw = await readFile(file, "utf8");
    const { at, data } = JSON.parse(raw);
    return { data, fresh: Date.now() - at < META_TTL };
  } catch {
    return null;
  }
}

async function writeCache(file, data) {
  try {
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(file, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* cache é best-effort */
  }
}

async function getJson(url, timeoutMs = 20000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

// Top de jogadores simultâneos (rank + concurrent + peak) — dado real.
export async function fetchTopChart() {
  const data = await getJson(
    "https://api.steampowered.com/ISteamChartsService/GetGamesByConcurrentPlayers/v1/"
  );
  const ranks = data?.response?.ranks || [];
  return ranks.map((r) => ({
    rank: r.rank,
    appid: String(r.appid),
    concurrent: r.concurrent_in_game,
    peak: r.peak_in_game,
  }));
}

// Nome/gênero de apps via loja, com cache em disco.
export async function fetchMetadata(appids) {
  const ids = [...new Set(appids.map(String))].filter(Boolean);
  const cacheFile = path.join(CACHE_DIR, "meta.json");
  const cached = await readCache(cacheFile);
  const meta = { ...(cached?.data || {}) };
  const missing = ids.filter((id) => !meta[id]);
  let needsWrite = false;

  // Busca em lotes de 30 para não estourar a loja.
  for (let i = 0; i < missing.length; i += 30) {
    const batch = missing.slice(i, i + 30);
    await Promise.all(
      batch.map(async (id) => {
        try {
          const data = await getJson(
            `https://store.steampowered.com/api/appdetails?appids=${id}&filters=basic,genres`,
            15000
          );
          const d = data?.[id]?.data;
          if (d) {
            meta[id] = {
              name: d.name || id,
              genres: (d.genres || []).map((g) => g.description),
            };
            needsWrite = true;
          }
        } catch {
          /* sem metadado → usa id */
        }
      })
    );
  }
  if (!cached?.fresh) meta.__fetchTime = Date.now();
  if (needsWrite || cached?.fresh === false) await writeCache(cacheFile, meta);
  return meta;
}

// Jogadores atuais de um app específico — dado real.
export async function fetchPlayers(appid) {
  const data = await getJson(
    `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appid}`,
    15000
  );
  return data?.response?.player_count ?? null;
}
