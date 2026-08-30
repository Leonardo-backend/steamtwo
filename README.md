# SteamTwo

Catálogo de jogos com dashboard de popularidade da Steam e Epic Games, interface em React/HTML/CSS/JS, API Node.js/Express e persistência PostgreSQL.

## Funcionalidades

- dashboard com mais jogados agora, média da última semana, popularidade histórica e recorde monitorado;
- catálogo pesquisável e filtrável por loja e gênero;
- ranking combinado transparente;
- página de detalhes com link para a loja oficial;
- **dados reais da Steam** coletados ao vivo (top público de jogadores simultâneos);
- snapshots diários imutáveis no disco para a métrica de última semana;
- fallback visual apenas se a rede/API da Steam estiver indisponível.

## Como os rankings funcionam

Cada posição de uma fonte é normalizada por `100 × (N - posição + 1) / N`. O índice combinado é a média das fontes disponíveis. Ausência em uma coleta válida vale zero; se a fonte inteira estiver indisponível, ela é excluída do cálculo.

- **Agora:** último snapshot válido da Steam (top público de jogadores simultâneos).
- **Última semana:** média dos snapshots diários válidos persistidos no disco.
- **De sempre:** proxy do pico de jogadores simultâneos da Steam; não representa horas jogadas.
- **Recorde monitorado:** maior índice registrado desde o início da coleta.

A Steam disponibiliza posição e jogadores simultâneos por API pública (sem chave). A coleção oficial da Epic é tentada primeiro; quando bloqueia coleta automatizada com `403/429`, o job usa o ranking público do egdata e identifica explicitamente o provedor como `egdata-fallback`. Como a Epic não fornece contagem pública de jogadores, essa fonte é excluída do índice.

Os coletores reais ficam em `server/collectors/steam.js` e o construtor do painel em `server/real-dashboard.js`. Snapshots diários são salvos em `data/snapshots/` e metadados em `data/steam-cache/`.

> O colecionador da IGDB (popularidade histórica) exige `TWITCH_CLIENT_ID`/`TWITCH_CLIENT_SECRET`; sem as chaves, o "De sempre" usa o pico real da Steam como proxy.

## Execução local

Requisitos: Node.js 20+ e PostgreSQL 17 (local ou via Docker).

```bash
npm install
# 1) Sobe o banco (via Docker) OU use um PostgreSQL local já instalado
docker compose up -d
# 2) Copie o ambiente e ajuste a DATABASE_URL se necessário
copy .env.example .env
# 3) Cria as tabelas (migrações via node-pg-migrate)
npm run db:migrate
# 4) Sobe a API + frontend
npm run dev:api
npm run dev
```

Frontend: `http://127.0.0.1:5173/`  
API: `http://127.0.0.1:3001/api/health` (o JSON traz `db: "postgres"` quando conectar)

### Integração com o banco

A API grava e lê os snapshots diários de ranking no **PostgreSQL** (tabela
`rank_snapshots` criada pela migração). Se o banco não estiver disponível, ela
cai automaticamente para arquivos em `data/snapshots/` — sem quebrar o app.

- `server/db.js` — pool de conexões (`DATABASE_URL`) e detecção de disponibilidade.
- `server/persistence.js` — camada de persistência (Postgres → fallback em disco).
- `server/real-dashboard.js` — monta o painel lendo/histórico do banco.
- Migrações: `migrations/*.cjs`; rodadas com `npm run db:migrate`.

Para enriquecer o catálogo com a IGDB, preencha `TWITCH_CLIENT_ID` e `TWITCH_CLIENT_SECRET` no `.env` e execute:

```bash
npm run sync:catalog
npm run sync:rankings
npm run sync:popularity
```

## Verificação

```bash
npm test
npm run build
npm run test:sites
```

O banco pode ser revertido uma migração por vez com `npm run db:rollback`.

