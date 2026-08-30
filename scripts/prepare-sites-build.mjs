// Prepara a pasta dist para o handoff ao Sites.
// Deve deixar: dist/client/index.html, dist/server/index.js, dist/.openai/hosting.json
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function main() {
  const distClient = path.join(root, "dist", "client");
  const distServer = path.join(root, "dist", "server");
  const distOpenAI = path.join(root, "dist", ".openai");

  await mkdir(distClient, { recursive: true });
  await mkdir(distServer, { recursive: true });
  await mkdir(distOpenAI, { recursive: true });

  const indexHtml = path.join(distClient, "index.html");
  if (!existsSync(indexHtml)) {
    throw new Error("dist/client/index.html não existe. Rode `vite build` antes.");
  }

  const hostingSrc = path.join(root, ".openai", "hosting.json");
  const hosting = JSON.parse(await readFile(hostingSrc, "utf8"));
  await writeFile(path.join(distOpenAI, "hosting.json"), JSON.stringify(hosting, null, 2));

  // O worker é o ponto de entrada do servidor no Sites.
  try {
    await copyFile(path.join(root, "worker", "index.js"), path.join(distServer, "index.js"));
  } catch {
    await writeFile(
      path.join(distServer, "index.js"),
      "export { default, handleRequest } from '../../worker/index.js';\n"
    );
  }

  // eslint-disable-next-line no-console
  console.log("[prepare-sites-build] dist pronto:");
  console.log("  - dist/client/index.html");
  console.log("  - dist/server/index.js");
  console.log("  - dist/.openai/hosting.json");
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[prepare-sites-build] falhou:", err.message);
  process.exit(1);
});
