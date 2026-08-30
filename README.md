# SteamTwo — Plataforma de Monitoramento e Análise de Jogos

> **Trabalho Acadêmico — Evolução e Integração Full-Stack (Front-end, Back-end e Banco de Dados)**  
> **Repositório:** [https://github.com/Leonardo-backend/steamtwo](https://github.com/Leonardo-backend/steamtwo)  
> **Integrantes da Equipe:**  
> - Raul [Sobrenome]  
> - Leonardo [Sobrenome]  
> - Inaiad [Sobrenome]  
> - Douglas [Sobrenome]  

---

## 🎮 Sobre o Projeto

O **SteamTwo** é uma plataforma analítica para acompanhamento de popularidade, rankings e métricas de engajamento de jogos digitais (Steam e Epic Games). O sistema consolida dados em tempo real, mantém histórico diário persistido no **PostgreSQL**, e disponibiliza uma interface moderna, responsiva e interativa em **React 19**.

---

## ✨ Melhorias Autorais e Novas Funcionalidades Implementadas

O projeto foi significativamente expandido a partir da base original, adicionando páginas completas, novos endpoints de API e recursos avançados de usabilidade:

1. **📊 Endpoint `/api/stats` e Widget de Métricas no Dashboard**:
   - Novo endpoint que consulta métricas agregadas do PostgreSQL (`games`, `rank_snapshots`) e status de conexão.
   - Painel visual no topo do Dashboard exibindo total de jogos monitorados, snapshots históricos e status da base de dados.

2. **🔍 Busca com Autocomplete em Tempo Real**:
   - Barra de pesquisa integrada no cabeçalho com debounce de 200ms e cancelamento automático de requisições.
   - Dropdown com miniaturas das capas, gênero, índice SteamTwo e navegação imediata para o jogo.

3. **🎮 Catálogo Unificado com Barra Compacta de Gêneros (`/jogos`)**:
   - Barra enxuta de tags/chips com contagem por categoria e ícones temáticos integrada diretamente no topo do catálogo.
   - Filtragem rápida e dinâmica em um clique sem ocupar espaço excessivo na tela, unindo busca, lojas e categorias em uma única visão fluida.

4. **📈 Gráfico SVG de Evolução Histórica do Ranking**:
   - Componente vetorial interativo em SVG puro na página de detalhes de cada jogo (`/api/games/:slug/history`).
   - Exibe a curva de evolução dos scores diários, linhas de grade, preenchimento em gradiente e tooltips informativas ao passar o mouse.

5. **❤️ Sistema de Favoritos e Página "Minha Lista" (`/minha-lista`)**:
   - Botão de favoritar (coração) disponível em todos os cards, no topo do dashboard e na tela de detalhes.
   - Persistência automática no `localStorage` do navegador e contador dinâmico em badge no menu principal.

6. **⚖️ Página Comparador de Jogos (`/comparar`)**:
   - Duelo estatístico lado a lado entre quaisquer dois títulos do catálogo (`GET /api/compare?a=...&b=...`).
   - Barras visuais comparativas destacando o vencedor em: Índice SteamTwo, Jogadores Simultâneos (Steam), Pico Histórico e Posição no Ranking.

7. **🌙☀️ Alternador de Tema Claro e Escuro (Light / Dark Mode)**:
   - Suporte completo a tema claro e escuro implementado via tokens CSS (`:root[data-theme="light"]` e `:root[data-theme="dark"]`).
   - Botão de alternância no cabeçalho com persistência da preferência do usuário no `localStorage`.

8. **🏆 Rankings Interativos com Filtros por Período e Loja (`/rankings`)**:
   - Tabela oficial de classificação com seleção de períodos (*Agora*, *Última Semana*, *De Sempre*) e filtro por loja (*Steam*, *Epic Games*).
   - Medalhas visuais (ouro, prata, bronze), mini barras de progresso e atalho para favoritar diretamente da tabela.

9. **🌱 Script de Seed Automatizado (`npm run db:seed`)**:
   - Popula a base PostgreSQL com o catálogo completo e histórico inicial de snapshots de ranking com 1 comando.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Detalhes |
|---|---|---|
| **Front-end** | React 19, Vite 6, CSS puro modular | Design responsivo, temas Claro/Escuro, SVG nativo |
| **Ícones** | `@phosphor-icons/react` | Ícones modernos e consistentes |
| **Back-end** | Node.js (ES Modules), Express 5 | API RESTful modular, endpoints validados |
| **Banco de Dados** | PostgreSQL 17 via `pg` (node-postgres) | Tabelas relacionais, índices e histórico imutável |
| **Migrações** | `node-pg-migrate` | Gerenciamento versionado de schema |
| **Testes** | Vitest, Supertest, pg-mem | Testes de integração, domínio e APIs |
| **Container** | Docker Compose | Ambiente PostgreSQL isolado e reprodutível |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js** v20 ou superior
- **Docker e Docker Compose** (ou PostgreSQL 17 instalado localmente)

### Passo a Passo

```bash
# 1. Clone o repositório
git clone https://github.com/Leonardo-backend/steamtwo.git
cd steamtwo

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env

# 4. Inicie o PostgreSQL (Docker Compose)
docker compose up -d

# 5. Execute as migrações no banco
npm run db:migrate

# 6. Popule o banco com dados iniciais (Seed)
npm run db:seed

# 7. Inicie a API e a aplicação Front-end
# Terminal 1 (API Back-end):
npm run dev:api

# Terminal 2 (Front-end Vite):
npm run dev
```

Acesse no seu navegador:
- **Front-end:** [http://127.0.0.1:5173/](http://127.0.0.1:5173/)
- **API Health Check:** [http://127.0.0.1:3001/api/health](http://127.0.0.1:3001/api/health)
- **API Stats:** [http://127.0.0.1:3001/api/stats](http://127.0.0.1:3001/api/stats)

---

## 🧪 Testes Automatizados

O projeto conta com suíte abrangente de testes automatizados unitários e de integração:

```bash
# Executar todos os testes
npm test

# Executar build de produção
npm run build
```

---

## 🔒 Segurança e Boas Práticas

- Arquivo `.env` incluído no `.gitignore` para impedir vazamento de credenciais.
- `.env.example` fornecido com valores padrão seguros de desenvolvimento local.
- Tratamento centralizado de erros e resiliência com fallback automático para operação contínua.


