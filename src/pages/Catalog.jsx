import { useEffect, useState, useRef } from "react";
import { MagnifyingGlass, X, Storefront, SteamLogo, Funnel, Sparkle } from "@phosphor-icons/react";
import { getCatalog, getGenres } from "../api.js";
import GameCard from "../components/GameCard.jsx";
import LiveBadge from "../components/LiveBadge.jsx";
import { SkeletonGrid } from "../components/Loading.jsx";

const STORES = [
  { id: "", label: "Todas as lojas" },
  { id: "steam", label: "Steam", icon: <SteamLogo size={16} weight="fill" /> },
  { id: "epic", label: "Epic Games", icon: <Storefront size={16} weight="fill" /> },
  { id: "both", label: "Ambas", icon: <Funnel size={16} weight="fill" /> },
];

const GENRE_ICONS = {
  RPG: "🗡️",
  Ação: "⚡",
  FPS: "🎯",
  MOBA: "⚔️",
  "Battle Royale": "👑",
  Tiro: "💥",
  Competitivo: "🏆",
  "Mundo aberto": "🌍",
  Party: "🎉",
  Casual: "🎲",
  Multijogador: "👥",
  Estratégia: "🧠",
  Aventura: "🧭",
  Simulação: "🚀",
  Outros: "🎮",
};

export default function Catalog({ navigate, favorites = [], toggleFavorite, isFavorite }) {
  // Inicializa com parâmetros da URL se existirem
  const initialParams = new URLSearchParams(window.location.search);
  const [query, setQuery] = useState({
    q: initialParams.get("q") || "",
    store: initialParams.get("store") || "",
    genre: initialParams.get("genre") || "",
  });

  const [genresData, setGenresData] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(query.q);
  const timer = useRef(null);

  // Carrega lista agregada de gêneros para a barra compacta
  useEffect(() => {
    let alive = true;
    getGenres().then((g) => {
      if (alive) setGenresData(g || []);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const q = query.q;
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (query.store) params.set("store", query.store);
    if (query.genre) params.set("genre", query.genre);
    const qs = params.toString();
    window.history.replaceState({}, "", `/jogos${qs ? `?${qs}` : ""}`);
    setLoading(true);
    getCatalog(query).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [query]);

  const onSearch = (value) => {
    setSearch(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setQuery((p) => ({ ...p, q: value })), 300);
  };

  const handleGenreClick = (genreName) => {
    setQuery((p) => ({
      ...p,
      genre: p.genre === genreName ? "" : genreName, // desmarca se clicar de novo
    }));
  };

  const go = (slug) => navigate(`/jogos/${slug}`);
  const isFiltered = query.q || query.store || query.genre;

  return (
    <div className="catalog page-shell">
      <div className="page-title">
        <div className="title-left">
          <span className="hero-kicker">
            <Sparkle size={16} weight="fill" /> Catálogo & Categorias
          </span>
          <h1>Catálogo de Jogos</h1>
          <p className="page-title-row">
            {data ? `${data.total} jogos encontrados` : "Carregando títulos…"}
            <LiveBadge live={data?.live} />
          </p>
        </div>
      </div>

      {/* Toolbar Principal: Busca + Filtro de Loja */}
      <div className="toolbar">
        <div className="search">
          <MagnifyingGlass size={20} />
          <input
            type="search"
            value={search}
            placeholder="Buscar por nome, gênero ou loja…"
            onChange={(e) => onSearch(e.target.value)}
            aria-label="Buscar jogos"
          />
          {search && (
            <button className="clear" aria-label="Limpar busca" onClick={() => onSearch("")}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filters">
          <div className="store-filter">
            {STORES.map((s) => (
              <button
                key={s.id}
                className={"chip" + (query.store === s.id ? " active" : "")}
                onClick={() => setQuery((p) => ({ ...p, store: s.id }))}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>

          {isFiltered && (
            <button
              className="chip clear-filter"
              onClick={() => {
                setQuery({ q: "", store: "", genre: "" });
                setSearch("");
              }}
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Barra Compacta e Enxuta de Gêneros Integrada */}
      <div className="compact-genre-bar-container">
        <div className="compact-genre-bar-label">
          <Funnel size={14} weight="fill" />
          <span>Filtrar por Gênero:</span>
        </div>
        <div className="compact-genre-chips" role="group" aria-label="Filtro rápido por gênero">
          <button
            className={"compact-genre-chip" + (!query.genre ? " active" : "")}
            onClick={() => setQuery((p) => ({ ...p, genre: "" }))}
          >
            <span>🎮 Todos</span>
          </button>
          {genresData.map((g) => {
            const isSelected = query.genre === g.genre;
            const icon = GENRE_ICONS[g.genre] || "🎮";
            return (
              <button
                key={g.genre}
                className={"compact-genre-chip" + (isSelected ? " active" : "")}
                onClick={() => handleGenreClick(g.genre)}
                aria-pressed={isSelected}
              >
                <span className="genre-chip-icon">{icon}</span>
                <span className="genre-chip-name">{g.genre}</span>
                <span className="genre-chip-badge">{g.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de Jogos ou Skeleton */}
      {loading ? (
        <SkeletonGrid count={8} />
      ) : data && data.items.length > 0 ? (
        <div className="game-grid">
          {data.items.map((item) => (
            <GameCard
              key={item.slug}
              item={item}
              onClick={go}
              isFavorite={isFavorite ? isFavorite(item.slug) : false}
              onToggleFavorite={toggleFavorite ? () => toggleFavorite(item) : null}
            />
          ))}
        </div>
      ) : (
        <div className="empty">
          <MagnifyingGlass size={40} />
          <p>Nenhum jogo encontrado para os filtros selecionados.</p>
          <button
            className="cta"
            onClick={() => {
              setQuery({ q: "", store: "", genre: "" });
              setSearch("");
            }}
          >
            Limpar todos os filtros
          </button>
        </div>
      )}
    </div>
  );
}
