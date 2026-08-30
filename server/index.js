import express from "express";
import { games, computeDashboard as fallbackDashboard, detailView as fallbackDetail } from "./data/fallback.js";
import { getDashboard as realDashboard, getCatalog as realCatalog, getDetail as realDetail } from "./real-dashboard.js";
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

app.get("/api/dashboard", async (_req, res) => {
  try {
    res.json(await realDashboard());
  } catch (e) {
    // Sem rede (ou API indisponível) → fallback visual com dados realistas.
    res.setHeader("X-SteamTwo-Source", "fallback");
    res.json({ ...fallbackDashboard(), live: false, error: e.message });
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
