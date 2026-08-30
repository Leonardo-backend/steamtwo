import { describe, it, expect, afterAll } from "vitest";
import { newDb } from "pg-mem";
import { pool, isDbAvailable, DATABASE_URL } from "../../server/db.js";

describe("integração com o PostgreSQL", () => {
  afterAll(async () => {
    await pool.end().catch(() => {});
  });

  it("DATABASE_URL ou fallback de configuração está consistente", () => {
    // Quando configurado no .env, deve seguir o padrão postgres://
    if (DATABASE_URL) {
      expect(DATABASE_URL).toMatch(/^postgres/);
    } else {
      expect(typeof DATABASE_URL).toBe("string");
    }
  });

  it("detecção de disponibilidade do banco retorna booleano sem travar", async () => {
    const ok = await isDbAvailable();
    expect(typeof ok).toBe("boolean");
  });

  it("simulação in-memory: executa migração de schema e queries do SteamTwo", async () => {
    const memDb = newDb();
    const memAdapter = memDb.adapters.createPg();
    const memPool = new memAdapter.Pool();

    // 1. Cria tabelas equivalentes à migração 1700000000000_init.cjs
    await memPool.query(`
      CREATE TABLE games (
        id SERIAL PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        genre TEXT NOT NULL,
        genres JSONB NOT NULL DEFAULT '[]'::jsonb,
        store TEXT NOT NULL,
        store_link TEXT,
        steam_app_id TEXT,
        epic_store_slug TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE rank_snapshots (
        id SERIAL PRIMARY KEY,
        source TEXT NOT NULL,
        game_slug TEXT NOT NULL,
        position INTEGER,
        players INTEGER,
        league_size INTEGER,
        captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE popularity_snapshots (
        id SERIAL PRIMARY KEY,
        source TEXT NOT NULL,
        game_slug TEXT NOT NULL,
        popularity INTEGER,
        captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX idx_rank_snapshots_source_date ON rank_snapshots (source, captured_at);
      CREATE INDEX idx_rank_snapshots_slug ON rank_snapshots (game_slug);
    `);

    // 2. Insere jogo de teste
    await memPool.query(`
      INSERT INTO games (slug, name, genre, store)
      VALUES ('elden-ring', 'Elden Ring', 'RPG', 'steam')
    `);

    // 3. Insere snapshot de ranking
    await memPool.query(`
      INSERT INTO rank_snapshots (source, game_slug, position, players, league_size)
      VALUES ('steam', 'elden-ring', 1, 18400, 100)
    `);

    // 4. Consulta e valida dados persistidos
    const gameResult = await memPool.query("SELECT * FROM games WHERE slug = 'elden-ring'");
    expect(gameResult.rows).toHaveLength(1);
    expect(gameResult.rows[0].name).toBe("Elden Ring");

    const snapResult = await memPool.query("SELECT * FROM rank_snapshots WHERE game_slug = 'elden-ring'");
    expect(snapResult.rows).toHaveLength(1);
    expect(snapResult.rows[0].position).toBe(1);
    expect(snapResult.rows[0].players).toBe(18400);

    await memPool.end();
  });
});
