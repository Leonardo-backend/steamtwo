import { Heart, Trash, GameController, ArrowRight } from "@phosphor-icons/react";
import GameCard from "../components/GameCard.jsx";

export default function MyList({ navigate, favorites = [], toggleFavorite, isFavorite, clearFavorites }) {
  const go = (slug) => navigate(`/jogos/${slug}`);

  return (
    <div className="mylist-page page-shell">
      <div className="page-title">
        <div className="title-left">
          <span className="hero-kicker">
            <Heart size={16} weight="fill" /> Coleção Pessoal
          </span>
          <h1>Minha Lista de Jogos</h1>
          <p className="page-desc">
            Seus títulos favoritos salvos localmente para acompanhamento rápido de rankings e métricas de popularidade.
          </p>
        </div>

        {favorites.length > 0 && (
          <div className="title-actions">
            <button className="clear-all-btn" onClick={clearFavorites} title="Limpar todos os favoritos">
              <Trash size={16} /> Limpar lista
            </button>
          </div>
        )}
      </div>

      {favorites.length > 0 ? (
        <>
          <div className="mylist-summary-bar">
            <span className="count-pill">
              <strong>{favorites.length}</strong> {favorites.length === 1 ? "jogo salvo" : "jogos salvos"}
            </span>
            <span className="save-hint">✓ Salvo automaticamente no seu navegador</span>
          </div>

          <div className="game-grid">
            {favorites.map((item) => (
              <GameCard
                key={item.slug}
                item={item}
                onClick={go}
                isFavorite={isFavorite ? isFavorite(item.slug) : true}
                onToggleFavorite={toggleFavorite ? () => toggleFavorite(item) : null}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="empty mylist-empty">
          <Heart size={56} weight="duotone" className="empty-heart-icon" />
          <h2>Sua lista de favoritos está vazia</h2>
          <p>
            Você ainda não favoritou nenhum jogo. Clique no ícone de coração (<Heart size={16} weight="fill" />) nos cards ou na página de detalhes para montar sua coleção personalizada.
          </p>
          <button className="cta" onClick={() => navigate("/jogos")}>
            <span>Explorar catálogo de jogos</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
