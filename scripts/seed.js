import "dotenv/config";
import pg from "pg";
import { GAMES } from "../server/data/games.js";

const { Pool } = pg;
const DATABASE_URL = process.env.DATABASE_URL || "postgres://steamtwo:steamtwo@127.0.0.1:5432/steamtwo";

async function main() {
  console.log("[seed] Conectando ao PostgreSQL em:", DATABASE_URL);
  const pool = new Pool({ connectionString: DATABASE_URL, connectionTimeoutMillis: 5000 });

  try {
    const client = await pool.connect();
    console.log("[seed] Conexão estabelecida com sucesso.");

    try {
      await client.query("BEGIN");

      console.log(`[seed] Inserindo ${GAMES.length} jogos curados...`);
      for (const g of GAMES) {
        await client.query(
          `INSERT INTO games (slug, name, genre, genres, store, store_link, steam_app_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (slug) DO UPDATE SET
             name = EXCLUDED.name,
             genre = EXCLUDED.genre,
             genres = EXCLUDED.genres,
             store = EXCLUDED.store,
             store_link = EXCLUDED.store_link,
             steam_app_id = EXCLUDED.steam_app_id`,
          [
            g.slug,
            g.name,
            g.genre,
            JSON.stringify(g.genres || [g.genre]),
            g.store,
            g.storeLink,
            g.appid ? String(g.appid) : null,
          ]
        );
      }

      console.log("[seed] Inserindo histórico inicial de snapshots...");
      const today = new Date();
      for (let dayOffset = 7; dayOffset >= 0; dayOffset--) {
        const snapDate = new Date(today.getTime() - dayOffset * 86400000);
        for (let i = 0; i < GAMES.length; i++) {
          const g = GAMES[i];
          if (g.store === "epic") continue; // Epic não tem jogadores simultâneos públicos
          const basePlayers = 15000 - i * 900;
          const randomVariation = Math.floor(Math.sin(dayOffset + i) * 1200);
          const players = Math.max(500, basePlayers + randomVariation);
          const rank = i + 1;

          await client.query(
            `INSERT INTO rank_snapshots (source, game_slug, position, players, league_size, captured_at)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            ["steam", g.slug, rank, players, 100, snapDate.toISOString()]
          );
        }
      }

      await client.query("COMMIT");
      console.log("[seed] ✅ Base de dados populada com sucesso!");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[seed] ❌ Erro ao executar seed no PostgreSQL:", err.message);
    console.log("[seed] 💡 Dica: Certifique-se de que o container do banco está rodando ('docker compose up -d') e as migrações foram executadas ('npm run db:migrate').");
  } finally {
    await pool.end();
  }
}

main();
