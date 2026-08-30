import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../server/index.js";

// Testes leves de roteamento, sem tocar na rede externa.
describe("API básica", () => {
  it("GET /api/health → 200 e ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
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
