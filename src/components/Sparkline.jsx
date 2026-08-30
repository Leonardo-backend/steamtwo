// Sparkline simples (SVG) da evolução diária do índice de um jogo.
export default function Sparkline({ values = [], width = 120, height = 34 }) {
  const n = values.length;
  if (n < 2) {
    // Sem histórico suficiente ainda.
    return (
      <span className="sparkline-empty" aria-hidden>
        histórico em formação
      </span>
    );
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (n - 1);
  const y = (v) => height - 4 - ((v - min) / range) * (height - 8);
  const points = values.map((v, i) => `${(i * step).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${points} ${width},${height} 0,${height}`;
  const lastX = width;
  const lastY = y(values[n - 1]);

  return (
    <svg
      className="sparkline"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Evolução do índice: ${values.map((v) => Math.round(v)).join(", ")}`}
    >
      <polygon points={area} fill="rgba(43,255,136,0.14)" />
      <polyline points={points} fill="none" stroke="#2bff88" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lastX} cy={lastY} r="3" fill="#2bff88" />
    </svg>
  );
}
