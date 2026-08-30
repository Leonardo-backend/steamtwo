// Painel com dados REAIS da Steam. Coleta o top de jogadores simultâneos,
// resolve nomes/gêneros e mantém um snapshot diário por dia (no disco).
// Se alguma fonte estiver indisponível (ex.: Epic), ela é excluída do índice.

import { GAMES, byAppid, bySlug, descriptionFor } from "./data/games.js";
import { fetchTopChart, fetchMetadata, fetchPlayers, TOP_LEAGUE } from "./collectors/steam.js";
import { normalizePosition, weeklyAverage, peakIndex, colorForSlug } from "./domain/ranking.js";
import { normalizeGenre, normalizeGenres } from "./domain/genres.js";
import { isGame, nonGameReason } from "./domain/kind.js";
import { saveSnapshot, loadSnapshots, hasSnapshot } from "./persistence.js";

const LIVE_TTL = 60 * 1000; // cache do build: 60s
const PLAYERS_TTL = 5 * 60 * 1000; // cache de jogadores de jogos curados: 5min

let liveCache = { at: 0, dashboard: null, entries: null };
const playersCache = new Map();

// ---------- coleta ----------
async function fetchEditorialPlayers(appids) {
  const result = {};
  await Promise.all(
    appids.map(async (id) => {
      const c = playersCache.get(id);
      if (c && Date.now() - c.at < PLAYERS_TTL) {
        result[id] = c.value;
        return;
      }
      try {
        const v = await fetchPlayers(id);
        playersCache.set(id, { at: Date.now(), value: v });
        result[id] = v;
      } catch {
        result[id] = null;
      }
    })
  );
  return result;
}

// Lista real: top-100 + jogos curados (dados reais de jogadores).
async function collect() {
  const chart = await fetchTopChart();
  const meta = await fetchMetadata(chart.map((e) => e.appid));

  const appids = new Set(chart.map((e) => e.appid));
  const editorial = GAMES.filter((g) => g.appid && !appids.has(String(g.appid)));
  const editorialPlayers = await fetchEditorialPlayers(editorial.map((g) => String(g.appid)));

  const entries = new Map();

  for (const e of chart) {
    const appid = String(e.appid);
    const curated = byAppid.get(appid);
    const rawGenres = curated?.genres || meta[appid]?.genres || [];
    const genres = normalizeGenres(rawGenres);
    entries.set(appid, {
      slug: curated?.slug || `steam-${appid}`,
      appid,
      name: curated?.name || meta[appid]?.name || appid,
      genre: curated?.genre || normalizeGenre(rawGenres[0]) || "Outros",
      genres: genres.length ? genres : [curated?.genre || "Outros"],
      color: curated?.color || colorForSlug(`steam-${appid}`),
      store: curated?.store || "steam",
      storeLink: curated?.storeLink || `https://store.steampowered.com/app/${appid}/`,
      tagline: curated?.tagline || `${meta[appid]?.name || appid} — em destaque agora`,
      steamRank: e.rank,
      players: e.concurrent,
      peak: e.peak,
      description: curated ? descriptionFor(curated) : "",
    });
  }

  for (const g of editorial) {
    const appid = String(g.appid);
    entries.set(appid, {
      slug: g.slug,
      appid,
      name: g.name,
      genre: g.genre,
      genres: g.genres,
      color: g.color,
      store: g.store,
      storeLink: g.storeLink,
      tagline: g.tagline,
      steamRank: null,
      players: editorialPlayers[appid] ?? null,
      peak: null,
      description: descriptionFor(g),
    });
  }

  return [...entries.values()];
}

function toNowRow(e) {
  return {
    slug: e.slug, appid: e.appid, name: e.name, genre: e.genre, color: e.color,
    store: e.store, storeLink: e.storeLink, steamRank: e.steamRank, players: e.players, peak: e.peak,
    index: normalizePosition(e.steamRank, TOP_LEAGUE),
  };
}

function toRow(e) {
  return {
    slug: e.slug, name: e.name, genre: e.genre, color: e.color, players: e.players,
    steamRank: e.steamRank, peak: e.peak, rank: e.rank, index: e.index,
    isGame: e.isGame, nonGameReason: e.nonGameReason,
  };
}

// ---------- montagem ----------
async function build() {
  const entries = await collect();

  const now = entries
    .filter((e) => e.steamRank != null)
    .map(toNowRow)
    .sort((a, b) => b.index - a.index || a.steamRank - b.steamRank)
    .map((r, i) => ({ ...r, rank: i + 1 }))
    // Ranking de JOGOS: exclui não-jogos (FiveM, Bongo Cat, etc.),
    // mas os mantém na lista `nonGames` para transparência.
    .map((r) => {
      const appid = r.appid;
      const game = isGame({ appid, name: r.name, slug: r.slug });
      return { ...r, isGame: game, nonGameReason: game ? null : nonGameReason({ appid, name: r.name }) };
    });
  const nonGames = now
    .filter((r) => !r.isGame)
    .map((r) => ({ ...r, nonGameReason: r.nonGameReason || nonGameReason({ appid: r.appid, name: r.name }) }));
  const gameNow = now.filter((r) => r.isGame);

  // Última semana: média dos snapshots diários reais.
  const snaps = await loadSnapshots(8);
  const weekMap = new Map();
  for (const s of snaps) {
    for (const x of s.entries) {
      const rec = weekMap.get(x.slug) || { sum: 0, n: 0, lastRank: null };
      rec.sum += x.rank;
      rec.n += 1;
      rec.lastRank = x.rank;
      weekMap.set(x.slug, rec);
    }
  }
  const baseNow = gameNow; // só jogos

  const lastWeek = baseNow
    .map((n) => {
      const w = weekMap.get(n.slug);
      const avgRank = w ? weeklyAverage([w.sum / w.n]) : n.steamRank;
      return {
        ...n,
        index: n.steamRank != null ? normalizePosition(Math.max(1, Math.round(avgRank)), TOP_LEAGUE) : 0,
      };
    })
    .sort((a, b) => b.index - a.index)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  // De sempre: proxy real pelo pico de jogadores simultâneos (só jogos).
  const maxPeak = Math.max(...baseNow.map((n) => n.peak || 0), 1);
  const allTime = baseNow
    .map((n) => ({ ...n, index: peakIndex(n.peak, maxPeak) }))
    .sort((a, b) => b.index - a.index)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  const top5 = baseNow.slice(0, 5).map(toRow);

  const recordSlug = baseNow[0]?.slug;
  const recRank = weekMap.get(recordSlug)?.lastRank;
  // Histórico diário do recorde para o sparkline.
  const history = snaps
    .filter((s) => s.entries.some((x) => x.slug === recordSlug))
    .map((s) => {
      const x = s.entries.find((e) => e.slug === recordSlug);
      return { date: s.day, index: normalizePosition(x.rank, TOP_LEAGUE), rank: x.rank };
    });
  const record = {
    slug: recordSlug,
    name: baseNow[0]?.name,
    value: recRank ? normalizePosition(recRank, TOP_LEAGUE) : baseNow[0]?.index,
    date: "monitorado desde o início da coleta",
    history,
  };

  const heroGame = bySlug.get("elden-ring");
  const heroEntry = entries.find((e) => e.slug === "elden-ring");
  const hero = {
    slug: heroGame?.slug,
    name: heroGame?.name,
    genre: heroGame?.genre,
    genres: heroGame?.genres || [],
    description: heroGame?.description || descriptionFor(heroGame),
    tagline: heroGame?.tagline,
    storeLink: heroGame?.storeLink,
    store: heroGame?.store,
    inTop100: heroEntry?.steamRank != null,
    rank: heroEntry?.steamRank ?? null,
    players: heroEntry?.players ?? null,
    peak: heroEntry?.peak ?? null,
    nowIndex: heroEntry?.steamRank != null ? normalizePosition(heroEntry.steamRank, TOP_LEAGUE) : null,
  };

  const sources = [
    { id: "steam", name: "Steam", available: true, leagueSize: TOP_LEAGUE, count: gameNow.length, note: "top público de jogadores simultâneos (jogos)" },
    { id: "epic", name: "Epic Games", available: false, leagueSize: null, count: 0, note: "sem contagem pública de jogadores — excluída do índice" },
    { id: "igdb", name: "IGDB (de sempre)", available: false, leagueSize: null, count: 0, note: "proxy por pico da Steam (requer chaves IGDB)" },
  ];

  const dashboard = {
    live: true,
    updatedAt: new Date().toISOString(),
    hero,
    now: baseNow.map(toRow),
    lastWeek: lastWeek.map(toRow),
    allTime: allTime.map(toRow),
    top5,
    record,
    sources,
    snapshots: snaps.length,
    catalogTotal: entries.length,
    nonGames: nonGames.map(toRow),
    exclusions: nonGames.length,
  };

  return { dashboard, entries };
}

async function getDashboard(force = false) {
  if (!force && liveCache.dashboard && Date.now() - liveCache.at < LIVE_TTL) return liveCache.dashboard;
  const { dashboard, entries } = await build();
  liveCache = { at: Date.now(), dashboard, entries };
  return dashboard;
}

// Garante UM snapshot por dia; usado pelo agendador.
export async function ensureDailySnapshot() {
  if (await hasSnapshot()) return false; // já coletado hoje
  const { dashboard, entries } = await build();
  await saveSnapshot(entries, TOP_LEAGUE);
  liveCache = { at: Date.now(), dashboard, entries };
  return true;
}

// ---------- catálogo ----------
async function getEntries(force = false) {
  if (liveCache.entries && Date.now() - liveCache.at < LIVE_TTL) return liveCache.entries;
  const { dashboard, entries } = await build();
  liveCache = { at: Date.now(), dashboard, entries };
  return entries;
}

function toCatalogItem(e) {
  return {
    slug: e.slug, appid: e.appid, name: e.name, tagline: e.tagline,
    genre: e.genre, genres: e.genres, store: e.store, storeLink: e.storeLink, color: e.color,
    steamRank: e.steamRank, players: e.players, peak: e.peak,
    index: normalizePosition(e.steamRank, TOP_LEAGUE),
  };
}

// Catálogo completo: jogos curados + todo o top-100 real da Steam.
async function getCatalog({ q = "", store = "", genre = "", limit = 120, page = 1 } = {}) {
  const entries = await getEntries();
  let _allList = entries;

  if (store === "steam") _allList = _allList.filter((e) => e.store !== "epic");
  else if (store === "epic") _allList = _allList.filter((e) => e.store !== "steam");
  else if (store === "both") _allList = _allList.filter((e) => e.store === "both");
  if (genre) _allList = _allList.filter((e) => normalizeGenre(e.genre) === genre);

  // Exclui não-jogos das buscas/filtros do catálogo.
  let list = _allList.filter((e) => isGame({ appid: e.appid, name: e.name, slug: e.slug }));
  if (q) {
    const n = String(q).toLowerCase();
    list = list.filter(
      (e) => e.name.toLowerCase().includes(n) || e.tagline.toLowerCase().includes(n)
    );
  }

  const items = list
    .map(toCatalogItem)
    .sort((a, b) => b.index - a.index || (a.steamRank ?? 999) - (b.steamRank ?? 999))
    .map((v, i) => ({ ...v, rank: i + 1 }));

  const genres = [...new Set(list.map((e) => e.genre))].filter(Boolean).sort();
  const excluded = _allList.filter((e) => !isGame({ appid: e.appid, name: e.name, slug: e.slug })).map(toCatalogItem).map((e) => ({ ...e, nonGameReason: nonGameReason(e) }));
  return { live: true, total: items.length, items, genres, excluded };
}

async function getDetail(slug) {
  const g = bySlug.get(slug);
  if (!g) {
    // Pode ser um jogo real do top-100 sem slug curado.
    const entries = await getEntries();
    const real = entries.find((e) => e.slug === slug);
    if (!real) return null;
    const inTop = real.steamRank != null;
    const maxPeak = Math.max(1, ...entries.map((e) => e.peak || 0));
    return {
      slug: real.slug, name: real.name, tagline: real.tagline, genre: real.genre, genres: real.genres,
      store: real.store, storeLink: real.storeLink, color: real.color,
      description: real.description || `${real.name} é um dos jogos mais populares do momento. Consulte a loja para detalhes.`,
      players: real.players, peak: real.peak,
      inTop100: inTop, steamRank: real.steamRank,
      index: inTop ? normalizePosition(real.steamRank, TOP_LEAGUE) : 0,
      historical: real.peak ? peakIndex(real.peak, maxPeak) : null,
      breakdown: [
        { key: "steam", label: "Steam", score: inTop ? normalizePosition(real.steamRank, TOP_LEAGUE) : 0, rank: real.steamRank, present: inTop },
      ],
    };
  }
  const entries = await getEntries();
  const row = entries.find((e) => e.slug === slug);
  const inTop100 = Boolean(row && row.steamRank != null);
  const snap = (await loadSnapshots(8)).find((s) => s.entries.some((x) => x.slug === slug));
  const allRow = row ? peakIndex(row.peak, Math.max(1, ...entries.map((e) => e.peak || 0))) : 0;
  return {
    slug: g.slug, name: g.name, tagline: g.tagline, genre: g.genre, genres: g.genres,
    store: g.store, storeLink: g.storeLink, color: g.color,
    description: descriptionFor(g),
    players: inTop100 ? row.players : row?.players ?? null,
    peak: row?.peak ?? null,
    inTop100,
    steamRank: inTop100 ? row.steamRank : null,
    index: inTop100 ? normalizePosition(row.steamRank, TOP_LEAGUE) : 0,
    historical: allRow || 0,
    breakdown: [
      { key: "steam", label: "Steam", score: inTop100 ? normalizePosition(row.steamRank, TOP_LEAGUE) : 0, rank: inTop100 ? row.steamRank : null, present: inTop100, note: inTop100 ? "posição no top público" : "fora do ranking ou fonte indisponível" },
      { key: "epic", label: "Epic Games", score: 0, rank: null, present: false, note: "sem contagem pública" },
    ],
  };
}

export { getDashboard, getCatalog, getDetail };
