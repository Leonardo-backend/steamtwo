// Config do node-pg-migrate. Lê DATABASE_URL do .env (dotenv).
require("dotenv").config();
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL não definida. Copie .env.example para .env e ajuste.");
  process.exit(1);
}
module.exports = {
  databaseUrl: url,
  migrationsTable: "pgmigrations",
  dir: "migrations",
  direction: "up",
  verbose: true,
};
