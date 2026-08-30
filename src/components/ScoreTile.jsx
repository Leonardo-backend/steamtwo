export default function ScoreTile({ name, color, size = 40 }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span className="score-tile" style={{ width: size, height: size, backgroundColor: color }} aria-hidden>
      <span>{initials}</span>
    </span>
  );
}
