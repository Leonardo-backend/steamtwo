import { games, computeDashboard, scoreFor } from "../data/fallback.js";

// CLI de sincronização. Sem PostgreSQL configurado, executa em modo fallback:
// calcula os rankings a partir dos dados realistas embutidos e imprime um
// resumo, mantendo o mesmo contrato de saída esperado pelos jobs reais.
//
//   node server/jobs/cli.js catalog
//   node server/jobs/cli.js rankings
//   node server/jobs/cli.js popularity

const command = process.argv[2] || "rankings";

function writeLine(label, value) {
  process.stdout.write(`${String(label).padEnd(28)} ${value}\n`);
}

function printSummary() {
  const dash = computeDashboard();

  writeLine("fontes ativas", dash.sources.filter((s) => s.available).map((s) => s.name).join(", "));
  writeLine("jogos rastreados", games.length);
  writeLine("snapshots (última semana)", 7);

  writeLine("AGORA — top 5", "");
  for (const r of dash.now.slice(0, 5)) writeLine(`  #${r.rank}`, `${r.name} — índice ${r.index}`);
  writeLine("ÚLTIMA SEMANA — top 3", "");
  for (const r of dash.lastWeek.slice(0, 3)) writeLine(`  #${r.rank}`, `${r.name} — índice ${r.index}`);
  writeLine("DE SEMPRE — top 3", "");
  for (const r of dash.allTime.slice(0, 3)) writeLine(`  #${r.rank}`, `${r.name} — índice ${r.index}`);

  writeLine("recorda monitorado", `${dash.record.name} — ${dash.record.value}`);
}

if (command === "catalog") {
  writeLine("catálogo (snapshots)", games.length);
  writeLine("espécies", `${[...new Set(games.map((g) => g.genre))].length}`);
  for (const g of games) writeLine(" ", `${g.slug} — ${g.store}`);
} else if (command === "rankings") {
  printSummary();
} else if (command === "popularity") {
  const dash = computeDashboard();
  writeLine("popularidade histórica (IGDB proxy)", "");
  for (const r of dash.allTime.slice(0, 5)) writeLine(`  #${r.rank}`, `${r.name} — ${r.index}`);
} else {
  writeLine("uso", "catalog | rankings | popularity");
}

// Expor para testes
export { scoreFor, computeDashboard, games };
