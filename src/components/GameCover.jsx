import { covers } from "../covers.js";
import ScoreTile from "./ScoreTile.jsx";

// Exibe a capa do jogo quando disponível; caso contrário, cai para o tile de
// cor + iniciais.
export function coverSrc(slug, name) {
  return covers[slug] || null;
}

export default function GameCover({ slug, name, color, className = "", imgClassName = "" }) {
  const src = covers[slug];
  if (!src) return <ScoreTile name={name} color={color} />;
  return <img className={`game-cover ${imgClassName}`.trim()} src={src} alt={`Capa de ${name}`} loading="lazy" />;
}
