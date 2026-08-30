import { useEffect, useState, useRef } from "react";
import { MagnifyingGlass, X, Storefront, SteamLogo, Funnel } from "@phosphor-icons/react";
import { getCatalog } from "../api.js";
import GameCard from "../components/GameCard.jsx";
import LiveBadge from "../components/LiveBadge.jsx";
import { SkeletonGrid } from "../components/Loading.jsx";

const STORES = [
  { id: "", label: "Todas as lojas" },
  { id: "steam", label: "Steam", icon: <SteamLogo size={16} weight="fill" /> },
  { id: "epic", label: "Epic Games", icon: <Storefront size={16} weight="fill" /> },
  { id: "both", label: "Ambas", icon: <Funnel size={16} weight="fill" /> },
];

export default function Catalog({ navigate, favorites = [], toggleFavorite, isFavorite }) {
  const [query, setQuery] = useState({ q: "", store: "", genre: "" });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const timer = useRef(null);

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

  const go = (slug) => navigate(`/jogos/${slug}`);
  const genres = data?.genres || [];

  const isFiltered = query.q || query.store || query.genre;

  return (
    <div className="catalog page-shell">
      <div className="page-title">
        <h1>Catálogo de jogos</h1>
        <p className="page-title-row">
          {data ? `${data.total} jogos monitorados` : "Carregando…"}
          <LiveBadge live={data?.live} />
        </p>
      </div>

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
          <select
            className="genre-filter"
            value={query.genre}
            onChange={(e) => setQuery((p) => ({ ...p, genre: e.target.value }))}
            aria-label="Filtrar por gênero"
          >
            <option value="">Todos os gêneros</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          {isFiltered && (
            <button
              className="chip clear-filter"
              onClick={() => {
                setQuery({ q: "", store: "", genre: "" });
                setSearch("");
              }}
            >
              Limpar
            </button>
          )}
        </div>
      </div>

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
          <p>Nenhum jogo encontrado para esses filtros.</p>
          <button className="cta" onClick={() => { setQuery({ q: "", store: "", genre: "" }); setSearch(""); }}>
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}
