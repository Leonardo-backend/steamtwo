import { Storefront, CaretRight, SteamLogo } from "@phosphor-icons/react";
import ScoreTile from "./ScoreTile.jsx";
import GameCover from "./GameCover.jsx";

const fmt = (n) => (n == null ? "—" : Math.round(n).toLocaleString("pt-BR"));

const STORE_LABEL = { steam: "Steam", epic: "Epic Games", both: "Steam + Epic" };

export default function GameCard({ item, onClick }) {
  const storeIcon = item.store === "epic" ? <Storefront size={16} weight="fill" /> : <SteamLogo size={16} weight="fill" />;
  return (
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
        <span className="game-card-index">{item.index}</span>
        <span className="game-card-store">
          {storeIcon} {STORE_LABEL[item.store]}
        </span>
      </div>
      <CaretRight className="game-card-arrow" size={20} weight="bold" />
    </button>
  );
}
