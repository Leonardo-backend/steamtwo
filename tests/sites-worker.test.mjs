import { test } from "node:test";
import assert from "node:assert/strict";
import { handleRequest } from "../worker/index.js";

const INDEX_HTML = "<!doctype html><html><body>steamtwo</body></html>";

test("rota não-API serve o index do SPA", async () => {
  const res = await handleRequest(new Request("http://localhost/"), { indexHtml: INDEX_HTML });
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /text\/html/);
  const body = await res.text();
  assert.match(body, /steamtwo/);
});

test("rota estática também cai no SPA (sem quebrar)", async () => {
  const res = await handleRequest(new Request("http://localhost/jogos/elden-ring"), { indexHtml: INDEX_HTML });
  assert.equal(res.status, 200);
});

test("rota /api é delegada à API externa", async () => {
  let hitUrl = null;
  const fakeFetch = async (req) => {
    hitUrl = req.url;
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  const res = await handleRequest(new Request("http://localhost/api/dashboard"), { fetchImpl: fakeFetch });
  assert.equal(res.status, 200);
  assert.match(hitUrl, /\/api\/dashboard/);
  const body = JSON.parse(await res.text());
  assert.equal(body.ok, true);
});
