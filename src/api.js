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
