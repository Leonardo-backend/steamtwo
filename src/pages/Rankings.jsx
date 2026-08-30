import { useEffect, useState } from "react";
import { Trophy, Fire, CalendarBlank, ChartLineUp, MagnifyingGlass, Storefront, SteamLogo, Heart } from "@phosphor-icons/react";
import { getDashboard, getCatalog } from "../api.js";
import GameCover from "../components/GameCover.jsx";
import LiveBadge from "../components/LiveBadge.jsx";
import Loading from "../components/Loading.jsx";

const PERIODS = [
  { id: "now", label: "Agora", icon: <Fire size={16} weight="fill" />, desc: "Top público de jogadores simultâneos coletados ao vivo" },
  { id: "lastWeek", label: "Última Semana", icon: <CalendarBlank size={16} weight="fill" />, desc: "Média ponderada dos snapshots diários dos últimos 7 dias" },
  { id: "allTime", label: "De Sempre", icon: <Trophy size={16} weight="fill" />, desc: "Popularidade histórica e recorde de pico de jogadores" },
];

const STORES = [
  { id: "", label: "Todas" },
  { id: "steam", label: "Steam", icon: <SteamLogo size={14} weight="fill" /> },
  { id: "epic", label: "Epic Games", icon: <Storefront size={14} weight="fill" /> },
];

export default function Rankings({ navigate, isFavorite, toggleFavorite }) {
  const [period, setPeriod] = useState("now");
  const [store, setStore] = useState("");
  const [search, setSearch] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([getDashboard(), getCatalog({ limit: 120 })]).then(([dashData, catData]) => {
      if (alive) {
        setDashboard(dashData);
        setCatalog(catData.items || []);
        setLoading(false);
      }
    });
    return () => { alive = false; };
  }, []);

  if (loading || !dashboard) {
    return <Loading label="Carregando rankings interativos…" />;
  }

  const go = (slug) => navigate(`/jogos/${slug}`);
  const fmt = (n) => (n == null ? "—" : Math.round(n).toLocaleString("pt-BR"));

  // Seleciona a lista de acordo com o período
  let list = dashboard[period] || dashboard.now || [];

  // Se a lista do dashboard tiver poucos itens, mesclamos com catálogo para exibição ampla
  if (list.length < 10 && catalog.length > 0) {
    list = catalog.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      index: item.index || Math.round((100 * (100 - idx)) / 100),
    }));
  }

  // Filtros
  if (store === "steam") list = list.filter((g) => g.store !== "epic");
  else if (store === "epic") list = list.filter((g) => g.store !== "steam");

  if (search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter((g) => (g.name || "").toLowerCase().includes(q) || (g.genre || "").toLowerCase().includes(q));
  }

  const curPeriod = PERIODS.find((p) => p.id === period);

  return (
    <div className="rankings-page page-shell">
      <div className="page-title">
        <div className="title-left">
          <span className="hero-kicker">
            <ChartLineUp size={16} weight="fill" /> Classificação
          </span>
          <h1>Rankings Oficiais SteamTwo</h1>
          <p className="page-desc">
            Explore as posições consolidadas de popularidade, alternando entre a tração em tempo real e o histórico acumulado.
          </p>
        </div>
        <LiveBadge live={dashboard.live} />
      </div>

      {/* Toolbar com abas de período e filtros */}
      <div className="rankings-toolbar">
        <div className="period-tabs" role="tablist">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={period === p.id}
              className={"period-tab" + (period === p.id ? " active" : "")}
              onClick={() => setPeriod(p.id)}
            >
              {p.icon}
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        <div className="rankings-filter-row">
          <div className="search small-search">
            <MagnifyingGlass size={16} />
            <input
              type="search"
              placeholder="Filtrar tabela…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Filtrar tabela"
            />
          </div>

          <div className="store-filter">
            {STORES.map((s) => (
              <button
                key={s.id}
                className={"chip small" + (store === s.id ? " active" : "")}
                onClick={() => setStore(s.id)}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="period-description-banner">
        <span className="info-icon">{curPeriod?.icon}</span>
        <span>{curPeriod?.desc}</span>
      </div>

      {/* Tabela de Rankings */}
      {list.length > 0 ? (
        <div className="rankings-table-wrap">
          <table className="rankings-table">
            <thead>
              <tr>
                <th className="th-pos">#</th>
                <th className="th-game">Jogo</th>
                <th className="th-genre">Gênero</th>
                <th className="th-store">Loja</th>
                <th className="th-players">Jogadores (Steam)</th>
                <th className="th-score">Índice SteamTwo</th>
                <th className="th-fav">Salvar</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item, index) => {
                const pos = item.rank || index + 1;
                const score = item.index ?? 0;
                const isFav = isFavorite ? isFavorite(item.slug) : false;

                return (
                  <tr key={item.slug || index} className="ranking-row" onClick={() => go(item.slug)}>
                    <td className="td-pos">
                      <span className={"rank-badge " + (pos === 1 ? "gold" : pos === 2 ? "silver" : pos === 3 ? "bronze" : "")}>
                        {pos}
                      </span>
                    </td>
                    <td className="td-game">
                      <div className="game-thumb-cell">
                        <div className="thumb-wrap">
                          <GameCover slug={item.slug} title={item.name} color={item.color} />
                        </div>
                        <div className="game-text">
                          <span className="game-name-link">{item.name}</span>
                          {item.tagline && <span className="game-sub">{item.tagline}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="td-genre">
                      <span className="genre-pill">{item.genre || "Outros"}</span>
                    </td>
                    <td className="td-store">
                      <span className="store-tag">
                        {item.store === "both" ? "Steam + Epic" : item.store === "epic" ? "Epic Games" : "Steam"}
                      </span>
                    </td>
                    <td className="td-players">
                      {item.players != null ? fmt(item.players) : "—"}
                    </td>
                    <td className="td-score">
                      <div className="score-cell">
                        <span className="score-number">{score}</span>
                        <div className="score-mini-bar">
                          <div className="score-mini-fill" style={{ width: `${Math.min(score, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="td-fav" onClick={(e) => e.stopPropagation()}>
                      <button
                        className={"fav-row-btn" + (isFav ? " active" : "")}
                        onClick={() => toggleFavorite && toggleFavorite(item)}
                        aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                        title={isFav ? "Remover da Minha Lista" : "Adicionar à Minha Lista"}
                      >
                        <Heart size={18} weight={isFav ? "fill" : "regular"} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">
          <p>Nenhum jogo encontrado para estes filtros de ranking.</p>
        </div>
      )}
    </div>
  );
}
