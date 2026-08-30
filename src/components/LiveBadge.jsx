export default function LiveBadge({ live }) {
  if (live === undefined) return null;
  return (
    <span className={"live-badge" + (live ? " on" : " off")}>
      <span className="live-dot" aria-hidden />
      {live ? "Dados ao vivo" : "Dados de reserva"}
    </span>
  );
}
