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
          {link("/jogos", "Catálogo & Gêneros", "catalog")}
          {link("/rankings", "Rankings", "rankings", <ChartLineUp size={15} />)}
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

        {/* Busca rápida com Autocomplete e Preview Rico */}
        <div className="header-search-wrap" ref={searchRef}>
          <div className="header-search-box">
            <MagnifyingGlass size={18} className="search-icon" />
            <input
              type="search"
              placeholder="Buscar jogos, gêneros, franquias… (Ex: Elden Ring, RPG)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && suggestions.length > 0 && setIsOpen(true)}
              onKeyDown={handleKeyDown}
              aria-label="Buscar jogo com preview instantâneo"
              aria-expanded={isOpen}
            />
            {searchQuery ? (
              <button className="search-clear-btn" onClick={() => setSearchQuery("")} aria-label="Limpar texto">
                <X size={16} />
              </button>
            ) : (
              <span className="search-kbd-hint">/</span>
            )}
          </div>

          {/* Dropdown de sugestões com Preview Rico */}
          {isOpen && (
            <div className="search-autocomplete-dropdown" role="listbox">
              <div className="dropdown-header">
                <span>Resultados da Busca</span>
                {suggestions.length > 0 && <span className="dropdown-count-badge">{suggestions.length} encontrados</span>}
              </div>

              {loading ? (
                <div className="dropdown-loading">
                  <div className="spinner-small" />
                  <span>Buscando títulos no catálogo…</span>
                </div>
              ) : suggestions.length > 0 ? (
                <ul className="suggestions-list">
                  {suggestions.map((item) => {
                    const gameName = item.name || item.slug;
                    const score = item.index != null ? item.index : item.score || 0;
                    return (
                      <li
                        key={item.slug}
                        className="suggestion-item"
                        onClick={() => handleSelectGame(item.slug)}
                        role="option"
                      >
                        <div className="sugg-cover">
                          <GameCover slug={item.slug} name={gameName} color={item.color} />
                        </div>
                        <div className="sugg-info">
                          <div className="sugg-title-row">
                            <span className="sugg-name">{gameName}</span>
                            {item.steamRank != null && (
                              <span className="sugg-rank-badge">#{item.steamRank}</span>
                            )}
                          </div>
                          {item.tagline && <span className="sugg-tagline">{item.tagline}</span>}
                          <div className="sugg-meta-row">
                            <span className="sugg-genre-tag">{item.genre || "Jogo"}</span>
                            <span className="sugg-store-tag">
                              {item.store === "epic" ? "Epic Games" : "Steam"}
                            </span>
                            {item.players != null && (
                              <span className="sugg-players-tag">
                                👥 {Math.round(item.players).toLocaleString("pt-BR")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="sugg-score-box">
                          <span className="sugg-score-val">{score}</span>
                          <span className="sugg-score-lbl">pts</span>
                        </div>
                      </li>
                    );
                  })}
                  <li className="suggestion-footer">
                    <button
                      className="suggestion-footer-btn"
                      onClick={() => {
                        setIsOpen(false);
                        navigate(`/jogos?q=${encodeURIComponent(searchQuery)}`);
                      }}
                    >
                      <span>Ver todos os resultados no catálogo</span>
                      <span className="footer-kbd-indicator">↵ Enter</span>
                    </button>
                  </li>
                </ul>
              ) : (
                <div className="dropdown-empty">
                  <span>Nenhum jogo encontrado para "<strong>{searchQuery}</strong>"</span>
                  <p>Tente buscar por título, como <em>Cyberpunk</em>, <em>Counter-Strike</em> ou <em>RPG</em>.</p>
                </div>
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
