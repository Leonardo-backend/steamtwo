import { Storefront, CaretRight, SteamLogo, Heart } from "@phosphor-icons/react";
import GameCover from "./GameCover.jsx";

const STORE_LABEL = { steam: "Steam", epic: "Epic Games", both: "Steam + Epic" };

export default function GameCard({ item, onClick, isFavorite = false, onToggleFavorite }) {
  const storeIcon = item.store === "epic" ? <Storefront size={16} weight="fill" /> : <SteamLogo size={16} weight="fill" />;
  return (
    <div className="game-card-wrapper">
      <button className="game-card" onClick={() => onClick(item.slug)}>
        <div className="game-card-cover">
          <GameCover slug={item.slug} name={item.name} color={item.color || "#3b5a72"} />
          <span className="game-rank-overlay">#{item.rank}</span>
        </div>
        <div className="game-card-body">
          <span className="game-card-name">{item.name}</span>
          <span className="game-card-tag">{item.tagline}</span>
          <span className="game-card-genre">{item.genre}</span>
        </div>
        <div className="game-card-foot">
          <span className="game-card-index">{item.index} pts</span>
          <span className="game-card-store">
            {storeIcon} {STORE_LABEL[item.store] || "Steam"}
          </span>
        </div>
        <CaretRight className="game-card-arrow" size={20} weight="bold" />
      </button>

      {onToggleFavorite && (
        <button
          className={"card-fav-btn" + (isFavorite ? " active" : "")}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          aria-label={isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
          title={isFavorite ? "Remover da Minha Lista" : "Adicionar à Minha Lista"}
        >
          <Heart size={18} weight={isFavorite ? "fill" : "bold"} />
        </button>
      )}
    </div>
  );
}
