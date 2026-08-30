import { fallbackDashboard, fallbackCatalog, fallbackDetail } from "./data/fallback.js";

async function fetchJson(path) {
  const res = await fetch(path, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getDashboard() {
  try {
    return await fetchJson("/api/dashboard");
  } catch {
    return fallbackDashboard();
  }
}

export async function getStats() {
  try {
    return await fetchJson("/api/stats");
  } catch {
    return {
      ok: true,
      db: "fallback",
      dbStatus: "down",
      gamesTotal: 14,
      snapshotsTotal: 1,
      lastSync: new Date().toISOString(),
      live: false,
      sources: [
        { id: "steam", name: "Steam", available: true, count: 14 },
        { id: "epic", name: "Epic Games", available: false, count: 0 },
        { id: "igdb", name: "IGDB", available: false, count: 0 },
      ],
    };
  }
}

export async function searchGames(q) {
  if (!q || String(q).trim().length < 1) return [];
  try {
    return await fetchJson(`/api/search?q=${encodeURIComponent(q)}`);
  } catch {
    const query = String(q).toLowerCase();
    const fallback = fallbackCatalog({ q });
    return (fallback.items || []).slice(0, 8);
  }
}

export async function getGenres() {
  try {
    return await fetchJson("/api/genres");
  } catch {
    const catalog = fallbackCatalog({});
    const map = new Map();
    for (const item of catalog.items || []) {
      const g = item.genre || "Outros";
      const cur = map.get(g) || { genre: g, count: 0, topGame: item };
      cur.count += 1;
      map.set(g, cur);
    }
    return [...map.values()];
  }
}

export async function getCatalog(query = {}) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.store) params.set("store", query.store);
  if (query.genre) params.set("genre", query.genre);
  const qs = params.toString();
  try {
    return await fetchJson(`/api/games${qs ? `?${qs}` : ""}`);
  } catch {
    return fallbackCatalog(query);
  }
}

export async function getGame(slug) {
  try {
    return await fetchJson(`/api/games/${encodeURIComponent(slug)}`);
  } catch (e) {
    try {
      return fallbackDetail(slug); // o jogo pode existir no fallback offline
    } catch {
      return null; // não existe em nenhuma fonte → página "não encontrado"
    }
  }
}

export async function getGameHistory(slug) {
  try {
    return await fetchJson(`/api/games/${encodeURIComponent(slug)}/history`);
  } catch {
    const detail = fallbackDetail(slug);
    if (!detail) return null;
    return {
      slug,
      name: detail.name,
      currentScore: detail.index || 90,
      history: [
        { date: "7 dias atrás", score: 86, players: 11000 },
        { date: "6 dias atrás", score: 88, players: 12500 },
        { date: "5 dias atrás", score: 89, players: 13000 },
        { date: "4 dias atrás", score: 91, players: 14500 },
        { date: "3 dias atrás", score: 92, players: 15200 },
        { date: "2 dias atrás", score: 94, players: 16800 },
        { date: "ontem", score: 95, players: 17900 },
        { date: "hoje", score: 96, players: 18400 },
      ],
    };
  }
}

export async function getRelatedGames(slug) {
  try {
    return await fetchJson(`/api/games/${encodeURIComponent(slug)}/related`);
  } catch {
    const detail = fallbackDetail(slug);
    if (!detail) return [];
    const catalog = fallbackCatalog({});
    return (catalog.items || [])
      .filter((g) => g.slug !== slug && g.genre === detail.genre)
      .slice(0, 4);
  }
}

export async function getCompare(slugA, slugB) {
  try {
    return await fetchJson(`/api/compare?a=${encodeURIComponent(slugA)}&b=${encodeURIComponent(slugB)}`);
  } catch {
    const gA = fallbackDetail(slugA);
    const gB = fallbackDetail(slugB);
    if (!gA || !gB) throw new Error("Jogos não encontrados para comparação.");
    return { gameA: gA, gameB: gB };
  }
}
