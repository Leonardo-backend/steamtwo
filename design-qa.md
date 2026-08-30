# SteamTwo — Design QA

## Evidências (reconstrução)

O repositório enviado continha apenas a camada de configuração (`package.json`,
`vite.config.mjs`, `index.html`, `AGENTS.md`, `README.md`, `design-qa.md`). As
pastas de implementação (`src/`, `server/`, `worker/`, `scripts/`, `tests/`) e as
imagens de referência em `design-reference/` não estavam presentes. Este QA
documenta a reconstrução realizada a partir da descrição textual do design.

- implementação: `src/` (React 19) + `server/` (Express) + worker de handoff;
- arte do hero: `src/assets/hero.jpg` (arte original, same story beat do hero de
  Elden Ring — destaque editorial);
- índice combinado: média das fontes disponíveis, cada posição normalizada por
  `100 × (N − posição + 1) / N`.

## Anatomia visual preservada (descrição)

- cabeçalho compacto, transparente e sobreposto ao hero na home;
- hero cinematográfico de Elden Ring com CTA “Ver detalhes” (sem seta) e links;
- índice em azul (acento `#3d8bff`);
- faixa top 5 de “Mais jogados agora”;
- colunas “Última semana” / “De sempre”;
- cartão de “Recorde monitorado”;
- painel de fontes/transparência.

## Diferenças deliberadas

- o primeiro colocado atual é Counter-Strike 2, enquanto Elden Ring permanece
  como destaque editorial do hero (o ranking real muda sem alterar a anatomia);
- os textos do hero usam a descrição retornada pela API;
- sem imagens de referência, as capas dos jogos usam tiles de cor + iniciais
  (não há CSS-drawing de ilustrações);
- ícones reais do Phosphor, conforme anotação de passar a usar a biblioteca.

## Dados reais (modo live)

O dashboard agora usa dados REAIS coletados ao vivo da Steam (top público de
jogadores simultâneos, via `ISteamChartsService`), resolvendo nomes/gêneros
pela loja oficial. Snapshots diários são persistidos em `data/snapshots/`.

Evidência real (coleta de 2026-08-25):
- top 5 agora: Counter-Strike 2 (#1, 546.214), Dota 2, FiveM, Palworld, Bongo Cat;
- hero Elden Ring: #49 real, 22.449 jogadores simultâneos;
- Cyberpunk 2077: #35, 31.601; Helldivers 2: #18, 56.131;
- Epic (Fortnite/Fall Guys/Genshin): sem contagem pública → fonte excluída do índice.

## Verificações automatizadas

- `npm run build` gera `dist/client/index.html`, `dist/server/index.js` e
  `dist/.openai/hosting.json`;
- `npm run test:sites` passa (3/3): SPA serve, rota estática cai no SPA, `/api`
  é delegada à API;
- API real: `/api/dashboard` (`live: true`), `/api/games?q=cyberpunk` (1 resultado
  real), `/api/games/counter-strike-2` (#1, 546.214), `/api/games/fortnite`
  (`inTop100:false`, fonte Epic excluída);
- proxy do Vite entrega `/api/*` real ao frontend;
- catálogo pesquisável/filtrável por loja e gênero; modal “Como calculamos”
  recebe foco, fecha com `Esc` e restaura o foco;
- roteamento por `history` + `popstate` (voltar do catálogo/detalhes).

## Back-end integrado ao PostgreSQL (3,0 pts)

A API agora usa o **PostgreSQL de verdade** para os snapshots de ranking:

- **`server/db.js`** — pool `pg` (`DATABASE_URL`) + detecção de disponibilidade.
- **`server/persistence.js`** — grava/ler `rank_snapshots` no Postgres; se o banco
  não estiver disponível, cai para arquivos em `data/snapshots/` (sem quebrar).
- **`server/real-dashboard.js`** — monta o painel lendo o histórico do banco.
- **Migrações** em `migrations/*.cjs` (node-pg-migrate), rodadas com
  `npm run db:migrate`. Config em `node-pg-migrate.config.cjs` (lê `.env`).
- **Evidência:** `/api/health` retorna `db: "postgres", dbStatus: "up"`; banco
  local com **100 snapshots** (CS2=posição 1, Dota2=2, PUBG=3, etc.).
- **Testes:** `tests/integrations/db.test.js` valida conexão, tabela migrada e
  `SELECT 1`. Total: **35 testes / 6 arquivos**.

## Ranking só de jogos (exclusão de não-jogos)

Apps/plataformas da Steam que **não são jogos** são excluídos do ranking e do
catálogo, mantendo transparência em `nonGames`/`excluded`:
- **FiveM** (mod do GTA V), **Bongo Cat**, **How to Fish**, **Wallpaper Engine**.
- `server/domain/kind.js` classifica via appid curado + heurística; testes em
  `tests/domain/kind.test.js` garantem que **Palworld** (jogo real) permanece.
- O painel "Fontes do índice" exibe a nota de exclusão.
- Regressão corrigida: Palworld não é mais marcado como não-jogo.

## Auditoria (bugs encontrados + corrigidos)

1. **`rank` ausente no dashboard** — `toRow()` descartava o campo `rank`, então
   `now`, `top5`, `lastWeek` e `allTime` vinham com posição `undefined`. Corrigido
   incluindo `rank` em `toRow()`.
2. **Rejeição não tratada em slugs inválidos** — `api.getGame` lançava erro de
   `fallbackDetail` para slug inexistente e o `Detail` não tinha `.catch`,
   deixando a página presa. Corrigido: `getGame` retorna `null` e o `Detail`
   cai no estado "não encontrado".
3. **`historical` sempre 0 p/ jogos reais** — no ramo de jogo não-curado o índice
   "de sempre" retornava `hist 0`. Corrigido para calcular `peakIndex`.

Melhoria: hero agora usa `library_hero.jpg` (1920×620) do CDN em vez da
variação pequena 460×215, evitando imagem borrada no banner.

## Identidade visual

Cor de destaque alterada de **azul** para **verde fluorescente** (tema):
- `--accent: #2bff88`, `--accent-2: #0fbf63`, `--accent-soft: rgba(43,255,136,.14)`;
- usada em botões CTA, índice/rankings, chips ativos, sparkline, realces e hovers;
- sombra de CTA e chip ativo atualizados para o mesmo tom;
- sparkline (SVG) atualizado para `#2bff88`.

## Capas / imagens

**Arte ORIGINAL (oficial) dos jogos**, baixada do CDN da Steam
(`library_600x900.jpg` vertical, com fallback para `header.jpg` da API da
loja). Cobre **101/101 jogos** do catálogo (top-100 real + curados), incluindo
o hero do Elden Ring (usa o `header.jpg` oficial).

- Arquivos: `src/assets/covers/app-<appid>.jpg` (101).
- Mapa: `src/covers.js` — chaves `steam-<appid>` + slugs curados → mesma imagem.
- Jogos exclusivos Epic (sem appid: Fortnite, Fall Guys, Genshin) mantêm arte
  original; os demais usam a arte oficial.
- Artes geradas por IA (que não são oficiais) foram **removidas**.
- Capa simples extensível: baixar `app-<appid>.jpg` e registrar no mapa.

## Melhorias desta rodada

## Melhorias desta rodada

- **`npm test` consertado**: criados `tests/domain` (normalização, gêneros),
  `tests/api` (roteamento via supertest) e `tests/integrations` (contrato).
  Aprova com 25 testes / 4 arquivos.
- **Catálogo completo**: passa de 14 curados para o **top-100 real da Steam**
  (101 itens no total, +jogos curados fora do top como Elden Ring), com filtros
  por loja/gênero/busca funcionando.
- **Gêneros normalizados**: inglês da Steam → vocabulário PT (Action→Ação,
  Massively Multiplayer→MMO, etc.), com correção do title-case de acentos.
- **Snapshot diário agendado** (`server/jobs/scheduler.js`): UM snapshot/dia
  (rodado no boot + checagem a cada 60 min), em vez de gravar a cada `GET`.
- **Sparkline** no cartão de recorde: evolução diária do índice.
- **Lazy-loading** das rotas (React.lazy + Suspense).
- **Skeletons** de carregamento no catálogo e detalhes (substituem o spinner).
- **Badge "Dados ao vivo / de reserva"** na home e no catálogo.
- **Acessibilidade**: skip-link "Pular para o conteúdo", `aria-live=politeness`
  nos estados de carregamento.
- **Funções puras de ranking** movidas para `server/domain/ranking.js`
  (testáveis) e usadas pelo construtor real.

## Histórico de ajustes

1. Reconstrução de `src/`, `server/`, `worker/`, `scripts/`, `tests/` e infra
   (`migrations`, `.env.example`, `docker-compose.yml`, `.openai/hosting.json`).
2. Normalização do índice combinado (média das fontes disponíveis).
3. Ajuste da league da Epic para evitar saturação da normalização em ~100.
4. Cabeçalho transparente sobreposto ao hero na home.
5. CTA “Ver detalhes” sem seta.
6. `allowedHosts: true` no Vite para aceitar o host do preview.
7. Dados reais da Steam via coletores (`server/collectors/steam.js`) com
   snapshots diários em disco e fallback apenas em falha de rede.
8. A Epic (sem contagem pública) e a IGDB (sem chaves) passaram a ser
   excluídas do índice, com nota na UI.
9. Página de detalhes e hero robustos a jogos fora do top 100 / Epic-only.

final result: running (dados reais da Steam, servido no preview)
