import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOTS_DIR = "/home/dex/Documentos/Steam-Two/screenshots";
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function main() {
  console.log("[screenshot] Iniciando Chromium para captura...");
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 850 },
    deviceScaleFactor: 1.5,
  });

  const page = await context.newPage();

  // 1. Dashboard
  console.log("[screenshot] 1. Capturando Dashboard...");
  await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
  await page.waitForSelector(".hero-content", { timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "dashboard.png") });

  // 2. Catálogo com Barra Compacta de Gêneros
  console.log("[screenshot] 2. Capturando Catálogo & Gêneros...");
  await page.goto("http://127.0.0.1:5173/jogos", { waitUntil: "networkidle" });
  await page.waitForSelector(".compact-genre-chips", { timeout: 15000 });
  await page.waitForSelector(".game-card", { timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "catalog_genres.png") });

  // 3. Rankings Oficiais
  console.log("[screenshot] 3. Capturando Rankings...");
  await page.goto("http://127.0.0.1:5173/rankings", { waitUntil: "networkidle" });
  await page.waitForSelector(".rankings-table", { timeout: 15000 });
  await page.waitForSelector(".ranking-row", { timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "rankings.png") });

  // 4. Comparador de Jogos
  console.log("[screenshot] 4. Capturando Comparador...");
  await page.goto("http://127.0.0.1:5173/comparar", { waitUntil: "networkidle" });
  await page.waitForSelector(".compare-cards-header", { timeout: 15000 });
  await page.waitForSelector(".compare-metrics-section", { timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "compare.png") });

  // 5. Detalhes com Gráfico SVG
  console.log("[screenshot] 5. Capturando Detalhes com Gráfico SVG...");
  await page.goto("http://127.0.0.1:5173/jogos/elden-ring", { waitUntil: "networkidle" });
  await page.waitForSelector(".detail-chart-section", { timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "detail.png") });

  // 6. Preview Rico da Barra de Pesquisa
  console.log("[screenshot] 6. Capturando Preview da Barra de Pesquisa...");
  await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
  const searchInput = await page.waitForSelector(".header-search-box input");
  await searchInput.fill("elden");
  await page.waitForSelector(".search-autocomplete-dropdown", { timeout: 15000 });
  await page.waitForSelector(".suggestion-item", { timeout: 15000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "search_preview.png") });

  // 7. Minha Lista / Favoritos
  console.log("[screenshot] 7. Capturando Minha Lista...");
  await page.goto("http://127.0.0.1:5173/jogos", { waitUntil: "networkidle" });
  // Clica no primeiro e segundo botão de favoritar dos cards
  const favBtns = await page.$$(".fav-btn");
  if (favBtns.length >= 2) {
    await favBtns[0].click();
    await page.waitForTimeout(300);
    await favBtns[1].click();
    await page.waitForTimeout(300);
  }
  await page.goto("http://127.0.0.1:5173/minha-lista", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "mylist.png") });

  await browser.close();
  console.log("[screenshot] ✅ Todas as 7 capturas de tela foram geradas com sucesso total!");
}

main().catch(err => {
  console.error("[screenshot] Erro:", err);
  process.exit(1);
});
