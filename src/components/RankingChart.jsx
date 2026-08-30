import { useState } from "react";

export default function RankingChart({ data = [], width = 560, height = 180 }) {
  const [activePoint, setActivePoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="chart-empty-state">
        <p>Histórico em formação. Novos snapshots são registrados diariamente.</p>
      </div>
    );
  }

  // Prepara valores numéricos
  const pointsData = data.map((d, i) => ({
    index: i,
    date: d.date || `Dia ${i + 1}`,
    score: typeof d.score === "number" ? d.score : (d.rank ? Math.round((100 * (100 - d.rank + 1)) / 100) : 50),
    players: d.players,
  }));

  const n = pointsData.length;
  if (n < 2) {
    return (
      <div className="chart-empty-state">
        <p>Aguardando mais coletas para traçar curva histórica.</p>
      </div>
    );
  }

  const PAD_X = 40;
  const PAD_Y = 25;
  const chartW = width - PAD_X * 2;
  const chartH = height - PAD_Y * 2;

  const minScore = 0;
  const maxScore = 100;

  const getX = (i) => PAD_X + (i / (n - 1)) * chartW;
  const getY = (score) => PAD_Y + chartH - ((score - minScore) / (maxScore - minScore)) * chartH;

  const coords = pointsData.map((d, i) => ({
    x: getX(i),
    y: getY(d.score),
    ...d,
  }));

  const polylineStr = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const areaStr = `${coords[0].x},${PAD_Y + chartH} ${polylineStr} ${coords[n - 1].x},${PAD_Y + chartH}`;

  return (
    <div className="ranking-chart-wrapper">
      <svg
        className="ranking-history-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Gráfico de evolução do índice SteamTwo"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2bff88" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#2bff88" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Linhas de grade horizontais */}
        {[0, 25, 50, 75, 100].map((val) => {
          const y = getY(val);
          return (
            <g key={val} className="chart-grid-line">
              <line x1={PAD_X} y1={y} x2={width - PAD_X} y2={y} stroke="var(--border)" strokeDasharray="3 3" />
              <text x={PAD_X - 8} y={y + 4} textAnchor="end" className="chart-axis-label">
                {val}
              </text>
            </g>
          );
        })}

        {/* Área preenchida */}
        <polygon points={areaStr} fill="url(#chartGradient)" />

        {/* Linha principal */}
        <polyline
          points={polylineStr}
          fill="none"
          stroke="#2bff88"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pontos interativos */}
        {coords.map((c, i) => {
          const isActive = activePoint?.index === i;
          return (
            <g key={i} className="chart-point-group" onMouseEnter={() => setActivePoint(c)} onMouseLeave={() => setActivePoint(null)}>
              <circle
                cx={c.x}
                cy={c.y}
                r={isActive ? 6 : 4}
                fill={isActive ? "#fff" : "#2bff88"}
                stroke="#080c11"
                strokeWidth="2"
                className="chart-circle"
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip do ponto hover */}
      {activePoint ? (
        <div className="chart-tooltip-info">
          <span className="tooltip-date">📅 {activePoint.date}</span>
          <span className="tooltip-score">
            Índice SteamTwo: <strong>{activePoint.score} pts</strong>
          </span>
          {activePoint.players != null && (
            <span className="tooltip-players">
              Jogadores: <strong>{Math.round(activePoint.players).toLocaleString("pt-BR")}</strong>
            </span>
          )}
        </div>
      ) : (
        <div className="chart-tooltip-info muted">
          <span>Passe o mouse pelos pontos do gráfico para ver detalhes de cada coleta</span>
        </div>
      )}
    </div>
  );
}
