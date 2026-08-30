import { useEffect, useState } from "react";
import { GameController, Funnel, ArrowRight } from "@phosphor-icons/react";
import { getGenres, getCatalog } from "../api.js";
import GameCard from "../components/GameCard.jsx";
import { SkeletonGrid } from "../components/Loading.jsx";

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

export default function Genres({ navigate, favorites, toggleFavorite, isFavorite }) {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [games, setGames] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [loadingGames, setLoadingGames] = useState(false);

  useEffect(() => {
    let alive = true;
    getGenres().then((data) => {
      if (alive) {
        setGenres(data);
        setLoadingGenres(false);
        if (data.length > 0) {
          setSelectedGenre(data[0].genre);
        }
      }
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!selectedGenre) return;
    let alive = true;
    setLoadingGames(true);
    getCatalog({ genre: selectedGenre }).then((d) => {
      if (alive) {
        setGames(d.items || []);
        setLoadingGames(false);
      }
    });
    return () => { alive = false; };
  }, [selectedGenre]);

  const go = (slug) => navigate(`/jogos/${slug}`);

  return (
    <div className="genres-page page-shell">
      <div className="page-title">
        <div className="title-left">
          <span className="hero-kicker">
            <Funnel size={16} weight="fill" /> Categorias
          </span>
          <h1>Explorar por Gênero</h1>
          <p className="page-desc">
            Navegue pelos principais gêneros monitorados e descubra os jogos mais populares em cada categoria.
          </p>
        </div>
      </div>

      {loadingGenres ? (
        <SkeletonGrid count={6} />
      ) : (
        <div className="genre-cards-grid">
          {genres.map((g) => {
            const isSelected = selectedGenre === g.genre;
            const icon = GENRE_ICONS[g.genre] || "🎮";
            return (
              <button
                key={g.genre}
                className={"genre-tile" + (isSelected ? " active" : "")}
                onClick={() => setSelectedGenre(g.genre)}
                aria-pressed={isSelected}
              >
                <span className="genre-tile-icon">{icon}</span>
                <div className="genre-tile-info">
                  <span className="genre-tile-title">{g.genre}</span>
                  <span className="genre-tile-count">{g.count} {g.count === 1 ? "jogo" : "jogos"}</span>
                </div>
                {g.topGame && (
                  <span className="genre-tile-top" title={`Em destaque: ${g.topGame.name}`}>
                    Top: {g.topGame.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {selectedGenre && (
        <section className="section genre-results-section">
          <div className="section-head">
            <h2>
              {GENRE_ICONS[selectedGenre] || "🎮"} Jogos em destaque — {selectedGenre} ({games.length})
            </h2>
            <button className="text-btn" onClick={() => navigate(`/jogos?genre=${encodeURIComponent(selectedGenre)}`)}>
              Ver no catálogo com filtros <ArrowRight size={16} />
            </button>
          </div>

          {loadingGames ? (
            <SkeletonGrid count={8} />
          ) : games.length > 0 ? (
            <div className="game-grid">
              {games.map((item) => (
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
              <GameController size={40} />
              <p>Nenhum jogo encontrado para a categoria {selectedGenre}.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
