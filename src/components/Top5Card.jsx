import GameCover from "./GameCover.jsx";

const fmt = (n) => (n == null ? "—" : Math.round(n).toLocaleString("pt-BR"));

export default function Top5Card({ item, onClick }) {
  return (
    <button className="top5-card" onClick={() => onClick(item.slug)}>
      <span className="top5-rank">{item.rank}</span>
      <div className="top5-body">
        <div className="top5-thumb">
          <GameCover slug={item.slug} name={item.name} color={item.color || "#3b5a72"} />
        </div>
        <div className="top5-info">
          <span className="top5-name">{item.name}</span>
          <span className="top5-sub">
            {item.players != null ? `${fmt(item.players)} jogando` : typeof item.genre === "string" ? item.genre : "—"}
          </span>
        </div>
      </div>
      <span className="top5-index">{item.index}</span>
    </button>
  );
}
