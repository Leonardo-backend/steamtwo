export default function ScoreTile({ name = "ST", color = "#3b5a72", size = 40 }) {
  const safeName = String(name || "ST").trim();
  const initials = (
    safeName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
  ) || "ST";

  return (
    <span className="score-tile" style={{ width: size, height: size, backgroundColor: color || "#3b5a72" }} aria-hidden>
      <span>{initials}</span>
    </span>
  );
}
