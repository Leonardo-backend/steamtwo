import { useState, useEffect, useRef } from "react";
import {
  GameController,
  Info,
  MagnifyingGlass,
  Sun,
  Moon,
  Heart,
  ArrowsLeftRight,
  ChartLineUp,
  Funnel,
  X,
} from "@phosphor-icons/react";
import { searchGames } from "../api.js";
import GameCover from "./GameCover.jsx";

export default function Header({
  overHero,
  navigate,
  onHow,
  current,
  favoritesCount = 0,
  theme = "dark",
  toggleTheme,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchGames(searchQuery);
        setSuggestions(results);
        setIsOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(debounceTimer.current);
  }, [searchQuery]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectGame = (slug) => {
    setIsOpen(false);
    setSearchQuery("");
    navigate(`/jogos/${slug}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter" && searchQuery.trim()) {
      setIsOpen(false);
      navigate(`/jogos?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const link = (to, label, routeName, icon = null) => {
    const active = current === routeName;
    return (
      <button className={"nav-link" + (active ? " active" : "")} onClick={() => navigate(to)}>
        {icon}
        <span>{label}</span>
      </button>
    );
  };

  return (
    <header className={"site-header" + (overHero ? " over-hero" : "")}>
      <div className="header-inner">
        <button className="brand" onClick={() => navigate("/")} aria-label="SteamTwo — ir para o início">
          <span className="brand-mark">
            <GameController size={22} weight="fill" />
          </span>
          <span className="brand-name">
            Steam<span className="brand-accent">Two</span>
          </span>
        </button>

        <nav className="nav" aria-label="Navegação principal">
          {link("/", "Início", "home")}
          {link("/jogos", "Catálogo", "catalog")}
          {link("/rankings", "Rankings", "rankings", <ChartLineUp size={15} />)}
          {link("/generos", "Gêneros", "genres", <Funnel size={15} />)}
          {link("/comparar", "Comparar", "compare", <ArrowsLeftRight size={15} />)}
          <button
            className={"nav-link" + (current === "mylist" ? " active" : "")}
            onClick={() => navigate("/minha-lista")}
            aria-label="Minha Lista"
          >
            <Heart size={15} weight={favoritesCount > 0 ? "fill" : "regular"} />
            <span>Minha Lista</span>
            {favoritesCount > 0 && <span className="nav-fav-badge">{favoritesCount}</span>}
          </button>
        </nav>

        {/* Busca rápida com Autocomplete */}
        <div className="header-search-wrap" ref={searchRef}>
          <div className="header-search-box">
            <MagnifyingGlass size={16} className="search-icon" />
            <input
              type="search"
              placeholder="Buscar jogo…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && suggestions.length > 0 && setIsOpen(true)}
              onKeyDown={handleKeyDown}
              aria-label="Buscar jogo instantaneamente"
              aria-expanded={isOpen}
            />
            {searchQuery && (
              <button className="search-clear-btn" onClick={() => setSearchQuery("")} aria-label="Limpar texto">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Dropdown de sugestões */}
          {isOpen && (
            <div className="search-autocomplete-dropdown" role="listbox">
              {loading ? (
                <div className="dropdown-loading">Buscando jogos…</div>
              ) : suggestions.length > 0 ? (
                <ul className="suggestions-list">
                  {suggestions.map((item) => (
                    <li
                      key={item.slug}
                      className="suggestion-item"
                      onClick={() => handleSelectGame(item.slug)}
                      role="option"
                    >
                      <div className="sugg-cover">
                        <GameCover slug={item.slug} title={item.name} color={item.color} />
                      </div>
                      <div className="sugg-info">
                        <span className="sugg-name">{item.name}</span>
                        <span className="sugg-genre">{item.genre}</span>
                      </div>
                      {item.index != null && (
                        <span className="sugg-score">{item.index} pts</span>
                      )}
                    </li>
                  ))}
                  <li className="suggestion-footer">
                    <button onClick={() => { setIsOpen(false); navigate(`/jogos?q=${encodeURIComponent(searchQuery)}`); }}>
                      Ver todos os resultados no catálogo →
                    </button>
                  </li>
                </ul>
              ) : (
                <div className="dropdown-empty">Nenhum jogo encontrado para "{searchQuery}"</div>
              )}
            </div>
          )}
        </div>

        <div className="header-actions">
          {/* Alternador de tema Claro / Escuro */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
            title={theme === "dark" ? "Modo Claro" : "Modo Escuro"}
          >
            {theme === "dark" ? <Sun size={18} weight="bold" /> : <Moon size={18} weight="fill" />}
          </button>

          <button className="how-btn" onClick={onHow}>
            <Info size={18} />
            <span>Como calculamos</span>
          </button>
        </div>
      </div>
    </header>
  );
}
