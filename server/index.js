import express from "express";
import { games, computeDashboard as fallbackDashboard, detailView as fallbackDetail } from "./data/fallback.js";
import {
  getDashboard as realDashboard,
  getCatalog as realCatalog,
  getDetail as realDetail,
  getStats as realStats,
  searchGames as realSearch,
  getGenresSummary as realGenres,
  getGameHistory as realHistory,
} from "./real-dashboard.js";
import { startSnapshotScheduler } from "./jobs/scheduler.js";
import { isDbAvailable } from "./db.js";

// Fallback do catálogo (usado apenas se a rede falhar).
function fallbackCatalog(q) {
  const { q: query = "", store = "", genre = "" } = q;
  let list = games;
  if (store === "steam") list = list.filter((g) => g.store !== "epic");
  else if (store === "epic") list = list.filter((g) => g.store !== "steam");
  else if (store === "both") list = list.filter((g) => g.store === "both");
  if (genre) list = list.filter((g) => g.genre === genre);
  if (query) {
    const n = String(query).toLowerCase();
    list = list.filter((g) => g.name.toLowerCase().includes(n) || g.tagline.toLowerCase().includes(n));
  }
  const items = list
    .map((g) => ({
      slug: g.slug, name: g.name, tagline: g.tagline, genre: g.genre, genres: g.genres,
      store: g.store, storeLink: g.storeLink, color: g.color,
      index: g.steamRank ? Math.round((100 * (100 - g.steamRank + 1)) / 100) : 0,
    }))
    .sort((a, b) => b.index - a.index)
    .map((v, i) => ({ ...v, rank: i + 1 }));
  return { total: items.length, items, genres: [...new Set(games.map((g) => g.genre))].sort() };
}

const app = express();
export const PORT = 3001;

app.use(express.json());

// CORS para o dev server na 5173
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/api/health", async (_req, res) => {
  const dbUp = await isDbAvailable();
  res.json({
    ok: true,
    service: "steamtwo-api",
    db: dbUp ? "postgres" : "fallback",
    dbStatus: dbUp ? "up" : "down",
    time: new Date().toISOString(),
  });
});

app.get("/api/stats", async (_req, res) => {
  try {
    res.json(await realStats());
  } catch (e) {
    const dbUp = await isDbAvailable();
    res.json({
      ok: true,
      db: dbUp ? "postgres" : "fallback",
      dbStatus: dbUp ? "up" : "down",
      gamesTotal: games.length,
      snapshotsTotal: 1,
      lastSync: new Date().toISOString(),
      live: false,
      sources: [
        { id: "steam", name: "Steam", available: true, count: games.length },
        { id: "epic", name: "Epic Games", available: false, count: 0 },
        { id: "igdb", name: "IGDB", available: false, count: 0 },
      ],
      error: e.message,
    });
  }
});

app.get("/api/dashboard", async (_req, res) => {
  try {
    res.json(await realDashboard());
  } catch (e) {
    // Sem rede (ou API indisponível) → fallback visual com dados realistas.
    res.setHeader("X-SteamTwo-Source", "fallback");
    res.json({ ...fallbackDashboard(), live: false, error: e.message });
  }
});

// Autocomplete e busca rápida
app.get("/api/search", async (req, res) => {
  try {
    const matches = await realSearch(req.query.q || "");
    res.json(matches);
  } catch (e) {
    const q = String(req.query.q || "").toLowerCase().trim();
    const matches = games
      .filter((g) => g.name.toLowerCase().includes(q) || g.slug.includes(q))
      .slice(0, 8)
      .map((g) => ({
        slug: g.slug,
        name: g.name,
        genre: g.genre,
        color: g.color,
        index: g.steamRank ? Math.round((100 * (100 - g.steamRank + 1)) / 100) : 0,
      }));
    res.json(matches);
  }
});

// Resumo e exploração por gêneros
app.get("/api/genres", async (_req, res) => {
  try {
    res.json(await realGenres());
  } catch (e) {
    const map = new Map();
    for (const g of games) {
      const cur = map.get(g.genre) || { genre: g.genre, count: 0, topGame: g };
      cur.count += 1;
      map.set(g.genre, cur);
    }
    res.json([...map.values()]);
  }
});

// Catálogo pesquisável / filtrável. Query: q, store, genre
app.get("/api/games", async (req, res) => {
  try {
    res.json(await realCatalog(req.query));
  } catch (e) {
    res.setHeader("X-SteamTwo-Source", "fallback");
    res.json({ ...fallbackCatalog(req.query), live: false });
  }
});

app.get("/api/games/:slug/history", async (req, res) => {
  try {
    const history = await realHistory(req.params.slug);
    if (history) return res.json(history);
    res.status(404).json({ error: "histórico não encontrado" });
  } catch (e) {
    const game = games.find((g) => g.slug === req.params.slug);
    if (!game) return res.status(404).json({ error: "jogo não encontrado" });
    res.json({
      slug: game.slug,
      name: game.name,
      currentScore: game.steamRank ? Math.round((100 * (100 - game.steamRank + 1)) / 100) : 0,
      history: [
        { date: "7 dias atrás", score: 88, players: 12000 },
        { date: "6 dias atrás", score: 90, players: 13500 },
        { date: "5 dias atrás", score: 89, players: 13000 },
        { date: "4 dias atrás", score: 91, players: 14200 },
        { date: "3 dias atrás", score: 93, players: 15800 },
        { date: "2 dias atrás", score: 92, players: 15100 },
        { date: "ontem", score: 94, players: 16900 },
        { date: "hoje", score: 95, players: 18400 },
      ],
    });
  }
});

app.get("/api/games/:slug/related", async (req, res) => {
  try {
    const detail = await realDetail(req.params.slug);
    if (!detail) return res.status(404).json({ error: "jogo não encontrado" });
    const catalog = await realCatalog({});
    const genre = detail.genre;
    const related = (catalog.items || [])
      .filter((g) => g.slug !== req.params.slug && (g.genre === genre || (g.genres && g.genres.includes(genre))))
      .slice(0, 4);
    res.json(related);
  } catch (e) {
    const game = games.find((g) => g.slug === req.params.slug);
    if (!game) return res.status(404).json({ error: "jogo não encontrado" });
    const related = games
      .filter((g) => g.slug !== req.params.slug && g.genre === game.genre)
      .slice(0, 4);
    res.json(related);
  }
});

app.get("/api/compare", async (req, res) => {
  const { a: slugA, b: slugB } = req.query;
  if (!slugA || !slugB) {
    return res.status(400).json({ error: "Parâmetros 'a' e 'b' (slugs dos jogos) são obrigatórios." });
  }
  try {
    const [gameA, gameB] = await Promise.all([realDetail(slugA), realDetail(slugB)]);
    if (!gameA || !gameB) {
      return res.status(404).json({ error: "Um ou ambos os jogos não foram encontrados." });
    }
    res.json({ gameA, gameB });
  } catch (e) {
    const gA = games.find((g) => g.slug === slugA);
    const gB = games.find((g) => g.slug === slugB);
    if (!gA || !gB) return res.status(404).json({ error: "Jogos não encontrados no fallback." });
    res.json({ gameA: fallbackDetail(slugA), gameB: fallbackDetail(slugB) });
  }
});

app.get("/api/games/:slug", async (req, res) => {
  try {
    const detail = await realDetail(req.params.slug);
    if (detail) return res.json({ ...detail, live: true });
    res.status(404).json({ error: "jogo não encontrado" });
  } catch (e) {
    const game = games.find((g) => g.slug === req.params.slug);
    if (!game) return res.status(404).json({ error: "jogo não encontrado" });
    res.json({ ...fallbackDetail(req.params.slug), live: false });
  }
});

// Rota de fallback p/ SPA no preview (se servido pelo próprio worker)
app.use("/api", (_req, res) => res.status(404).json({ error: "rota não encontrada" }));

export default app;

// Só inicia o servidor quando executado diretamente
const isMain = process.argv[1] && process.argv[1].endsWith("index.js");
if (isMain) {
  startSnapshotScheduler(); // 1 snapshot/dia
  app.listen(PORT, "0.0.0.0", () => {
    // eslint-disable-next-line no-console
    console.log(`[steamtwo] API rodando em http://127.0.0.1:${PORT}/api/health`);
  });
}
