// Entry no estilo Worker para o handoff ao Sites.
// - Rotas /api/* são delegadas à API Express (porta 3001 local).
// - Todas as demais rotas servem o SPA construído em dist/client.
//
// Mantido intacto: é o ponto de entrada usado pelo worker do Sites.

export const DEFAULT_API_URL = process.env.API_URL || "http://127.0.0.1:3001";

const FALLBACK_HTML = `<!doctype html>
<html lang="pt-BR"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>SteamTwo</title></head>
<body><div id="root"></div></body></html>`;

export async function handleRequest(req, opts = {}) {
  const fetchImpl = opts.fetchImpl || globalThis.fetch;
  const url = new URL(req.url);

  if (url.pathname.startsWith("/api/")) {
    const target = `${DEFAULT_API_URL}${url.pathname}${url.search}`;
    return fetchImpl(new Request(target, { method: req.method, headers: req.headers, body: req.body }));
  }

  const indexHtml = opts.indexHtml || FALLBACK_HTML;
  return new Response(indexHtml, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default { fetch: handleRequest };
