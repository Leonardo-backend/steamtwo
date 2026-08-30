import { describe, it, expect, afterAll } from "vitest";
import { pool, isDbAvailable, DATABASE_URL } from "../../server/db.js";

describe("integração com o PostgreSQL", () => {
  afterAll(async () => {
    // fecha o pool ao final dos testes
    await pool.end().catch(() => {});
  });

  it("DATABASE_URL está definida", () => {
    expect(DATABASE_URL).toBeTruthy();
    expect(DATABASE_URL).toMatch(/^postgres/);
  });

  it("o banco está disponível", async () => {
    const ok = await isDbAvailable();
    expect(ok).toBe(true);
  });

  it("a tabela rank_snapshots existe (migração rodada)", async () => {
    const { rows } = await pool.query(
      `SELECT to_regclass('public.rank_snapshots') AS t`
    );
    expect(rows[0].t).toBe("rank_snapshots");
  });

  it("consegue executar SELECT 1", async () => {
    const { rows } = await pool.query("SELECT 1 AS one");
    expect(rows[0].one).toBe(1);
  });
});
