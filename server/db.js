// Conexão com o PostgreSQL via pool. Usa DATABASE_URL do .env.
// Detecta de forma não-bloqueante se o banco está disponível para que o
// app continue funcionando mesmo se o Postgres não estiver configurado.
import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

export const DATABASE_URL = process.env.DATABASE_URL || "";

export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 4000,
});

let dbAvailable = null; // cache

export async function isDbAvailable() {
  if (dbAvailable !== null) return dbAvailable;
  if (!DATABASE_URL) return (dbAvailable = false);
  try {
    await pool.query("SELECT 1");
    dbAvailable = true;
  } catch {
    dbAvailable = false;
  }
  return dbAvailable;
}

// Reseta o cache para re-testar (ex.: subiu o banco depois).
export function resetDbFlag() {
  dbAvailable = null;
}
