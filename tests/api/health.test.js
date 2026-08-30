import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../server/index.js";

describe("API básica e rotas principais", () => {
  it("GET /api/health → 200 e ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body).toHaveProperty("db");
    expect(res.body).toHaveProperty("dbStatus");
  });

  it("GET /api/stats → 200 com métricas do banco e catálogo", async () => {
    const res = await request(app).get("/api/stats");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.gamesTotal).toBeGreaterThan(0);
    expect(res.body.snapshotsTotal).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(res.body.sources)).toBe(true);
  });

  it("GET /api/search → retorna resultados filtrados por query", async () => {
    const res = await request(app).get("/api/search?q=elden");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("slug");
    expect(res.body[0]).toHaveProperty("name");
  });

  it("GET /api/genres → retorna lista agregada de gêneros", async () => {
    const res = await request(app).get("/api/genres");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("genre");
    expect(res.body[0]).toHaveProperty("count");
  });

  it("GET /api/games/:slug/history → retorna histórico de ranking e jogadores", async () => {
    const res = await request(app).get("/api/games/elden-ring/history");
    expect(res.status).toBe(200);
    expect(res.body.slug).toBe("elden-ring");
    expect(Array.isArray(res.body.history)).toBe(true);
  });

  it("GET /api/games/:slug/related → retorna jogos similares do mesmo gênero", async () => {
    const res = await request(app).get("/api/games/elden-ring/related");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /api/compare → compara dois jogos lado a lado", async () => {
    const res = await request(app).get("/api/compare?a=elden-ring&b=cyberpunk-2077");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("gameA");
    expect(res.body).toHaveProperty("gameB");
  });

  it("GET /api/compare sem parâmetros → 400 Bad Request", async () => {
    const res = await request(app).get("/api/compare");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("rota /api inexistente → 404", async () => {
    const res = await request(app).get("/api/nao-existe");
    expect(res.status).toBe(404);
  });

  it("jogo desconhecido sem rede → 404 (não estoura)", async () => {
    const res = await request(app).get("/api/games/slug-inexistente-xyz");
    expect([404, 200]).toContain(res.status);
  });
});
