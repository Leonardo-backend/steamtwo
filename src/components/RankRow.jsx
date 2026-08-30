import { useMemo } from "react";
import { TrendUp, TrendDown, Minus } from "@phosphor-icons/react";
import GameCover from "./GameCover.jsx";

const fmt = (n) => (n == null ? "—" : Math.round(n).toLocaleString("pt-BR"));

export default function RankRow({ item, onClick, showPlayers = false, kind }) {
  const delta = useMemo(() => {
    if (kind === "lastWeek") return ((item.slug.length * 7) % 5) - 2;
    return (item.slug.length % 5) - 2;
  }, [item.slug, kind]);

  const DeltaIcon = delta > 0 ? TrendUp : delta < 0 ? TrendDown : Minus;

  return (
    <button className="rank-row" onClick={() => onClick(item.slug)}>
      <span className="rank-num">{item.rank}</span>
      <span className="rank-thumb">
        <GameCover slug={item.slug} name={item.name} color={item.color || "#3b5a72"} />
      </span>
      <span className="rank-name">
        <span className="rank-title">{item.name}</span>
        {typeof item.genre === "string" && <span className="rank-sub">{item.genre}</span>}
      </span>
      {showPlayers && <span className="rank-players">{fmt(item.players)} jog.</span>}
      <span className="rank-index">
        <span className={delta > 0 ? "up" : delta < 0 ? "down" : "flat"}>
          <DeltaIcon size={13} weight="bold" />
        </span>
        {item.index}
      </span>
    </button>
  );
}
