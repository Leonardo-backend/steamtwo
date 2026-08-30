import { useEffect, useState } from "react";
import { ArrowsLeftRight, Trophy, Users, ChartLine, Storefront, ArrowRight, Fire } from "@phosphor-icons/react";
import { getCatalog, getCompare } from "../api.js";
import GameCover from "../components/GameCover.jsx";
import Loading from "../components/Loading.jsx";

const PRESET_PAIRS = [
  { label: "Elden Ring vs Cyberpunk 2077", a: "elden-ring", b: "cyberpunk-2077" },
  { label: "Counter-Strike 2 vs Apex Legends", a: "counter-strike-2", b: "apex-legends" },
  { label: "Baldur's Gate 3 vs The Witcher 3", a: "baldurs-gate-3", b: "the-witcher-3-wild-hunt" },
  { label: "Dota 2 vs PUBG", a: "dota-2", b: "pubg-battlegrounds" },
];

function CompareBar({ label, icon, valA, valB, format = (v) => v, isHigherBetter = true }) {
  const numA = typeof valA === "number" ? valA : 0;
  const numB = typeof valB === "number" ? valB : 0;
  const max = Math.max(numA, numB, 1);
  const pctA = Math.round((numA / max) * 100);
  const pctB = Math.round((numB / max) * 100);

  const winA = isHigherBetter ? numA > numB : numA < numB && numA > 0;
  const winB = isHigherBetter ? numB > numA : numB < numA && numB > 0;
  const tie = numA === numB;

  return (
    <div className="compare-metric-row">
      <div className="metric-header">
        <span className="metric-icon-label">
          {icon} {label}
        </span>
      </div>
      <div className="compare-bar-container">
        <div className="compare-bar-side left">
          <div className="bar-val-badge">
            <span className={"val" + (winA ? " winner" : "")}>{valA != null ? format(valA) : "—"}</span>
            {winA && <span className="winner-pill">Vencedor</span>}
          </div>
          <div className="bar-track">
            <div className={"bar-fill" + (winA ? " winner-fill" : "")} style={{ width: `${pctA}%` }} />
          </div>
        </div>

        <div className="compare-bar-divider">vs</div>

        <div className="compare-bar-side right">
          <div className="bar-val-badge right-badge">
            {winB && <span className="winner-pill">Vencedor</span>}
            <span className={"val" + (winB ? " winner" : "")}>{valB != null ? format(valB) : "—"}</span>
          </div>
          <div className="bar-track right-track">
            <div className={"bar-fill" + (winB ? " winner-fill" : "")} style={{ width: `${pctB}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Compare({ navigate }) {
  const [catalog, setCatalog] = useState([]);
  const [slugA, setSlugA] = useState("elden-ring");
  const [slugB, setSlugB] = useState("cyberpunk-2077");
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getCatalog({ limit: 120 }).then((d) => {
      if (alive && d.items) {
        setCatalog(d.items);
      }
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!slugA || !slugB) return;
    let alive = true;
    setLoading(true);
    getCompare(slugA, slugB).then((res) => {
      if (alive) {
        setComparison(res);
        setLoading(false);
      }
    }).catch(() => {
      if (alive) setLoading(false);
    });
    return () => { alive = false; };
  }, [slugA, slugB]);

  const go = (slug) => navigate(`/jogos/${slug}`);
  const fmt = (n) => (n == null ? "—" : Math.round(n).toLocaleString("pt-BR"));

  const gameA = comparison?.gameA;
  const gameB = comparison?.gameB;

  return (
    <div className="compare-page page-shell">
      <div className="page-title">
        <div className="title-left">
          <span className="hero-kicker">
            <ArrowsLeftRight size={16} weight="fill" /> Duelo
          </span>
          <h1>Comparador de Jogos</h1>
          <p className="page-desc">
            Compare lado a lado o desempenho em tempo real, popularidade histórica e métricas de engajamento de quaisquer dois títulos.
          </p>
        </div>
      </div>

      {/* Sugestões rápidas */}
      <div className="preset-row">
        <span className="preset-label">Comparações populares:</span>
        {PRESET_PAIRS.map((p) => (
          <button
            key={p.label}
            className={"preset-chip" + (slugA === p.a && slugB === p.b ? " active" : "")}
            onClick={() => { setSlugA(p.a); setSlugB(p.b); }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Seletores */}
      <div className="compare-selectors-grid">
        <div className="selector-card">
          <label htmlFor="select-game-a">Selecione o 1º Jogo:</label>
          <select
            id="select-game-a"
            value={slugA}
            onChange={(e) => setSlugA(e.target.value)}
            className="game-select"
          >
            {catalog.map((g) => (
              <option key={g.slug} value={g.slug} disabled={g.slug === slugB}>
                {g.name} ({g.genre})
              </option>
            ))}
          </select>
        </div>

        <div className="selector-vs">
          <span>VS</span>
        </div>

        <div className="selector-card">
          <label htmlFor="select-game-b">Selecione o 2º Jogo:</label>
          <select
            id="select-game-b"
            value={slugB}
            onChange={(e) => setSlugB(e.target.value)}
            className="game-select"
          >
            {catalog.map((g) => (
              <option key={g.slug} value={g.slug} disabled={g.slug === slugA}>
                {g.name} ({g.genre})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <Loading label="Carregando comparação…" />
      ) : gameA && gameB ? (
        <div className="compare-results">
          {/* Header de comparação de cards */}
          <div className="compare-cards-header">
            <div className="compare-game-box left-box">
              <div className="box-cover" onClick={() => go(gameA.slug)}>
                <GameCover slug={gameA.slug} title={gameA.name} color={gameA.color} />
              </div>
              <div className="box-info">
                <h2>{gameA.name}</h2>
                <span className="box-genre">{gameA.genre}</span>
                <p className="box-tagline">{gameA.tagline}</p>
                <div className="box-actions">
                  <button className="cta small" onClick={() => go(gameA.slug)}>
                    Ver página <ArrowRight size={14} />
                  </button>
                  <a className="cta ghost small" href={gameA.storeLink} target="_blank" rel="noreferrer">
                    <Storefront size={14} /> Loja
                  </a>
                </div>
              </div>
            </div>

            <div className="compare-game-box right-box">
              <div className="box-cover" onClick={() => go(gameB.slug)}>
                <GameCover slug={gameB.slug} title={gameB.name} color={gameB.color} />
              </div>
              <div className="box-info">
                <h2>{gameB.name}</h2>
                <span className="box-genre">{gameB.genre}</span>
                <p className="box-tagline">{gameB.tagline}</p>
                <div className="box-actions">
                  <button className="cta small" onClick={() => go(gameB.slug)}>
                    Ver página <ArrowRight size={14} />
                  </button>
                  <a className="cta ghost small" href={gameB.storeLink} target="_blank" rel="noreferrer">
                    <Storefront size={14} /> Loja
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos de barras comparativos */}
          <div className="compare-metrics-section">
            <h3 className="section-subtitle">Duelo de Métricas</h3>

            <CompareBar
              label="Índice SteamTwo (Agora)"
              icon={<Fire size={18} weight="fill" />}
              valA={gameA.index}
              valB={gameB.index}
              format={(v) => `${v} pts`}
            />

            <CompareBar
              label="Jogadores Simultâneos (Steam)"
              icon={<Users size={18} weight="fill" />}
              valA={gameA.players}
              valB={gameB.players}
              format={(v) => fmt(v)}
            />

            <CompareBar
              label="Pico Histórico (Jogadores)"
              icon={<Trophy size={18} weight="fill" />}
              valA={gameA.peak}
              valB={gameB.peak}
              format={(v) => fmt(v)}
            />

            <CompareBar
              label="Posição no Top 100"
              icon={<ChartLine size={18} weight="fill" />}
              valA={gameA.steamRank}
              valB={gameB.steamRank}
              format={(v) => (v != null ? `#${v}` : "Fora do top")}
              isHigherBetter={false}
            />
          </div>

          {/* Tabela de detalhes comparativos */}
          <div className="compare-table-section">
            <h3 className="section-subtitle">Ficha Técnica Comparativa</h3>
            <table className="compare-table">
              <thead>
                <tr>
                  <th>{gameA.name}</th>
                  <th>Característica</th>
                  <th>{gameB.name}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{gameA.genre}</td>
                  <td className="center-feature">Gênero Principal</td>
                  <td>{gameB.genre}</td>
                </tr>
                <tr>
                  <td>{gameA.genres?.join(", ") || "—"}</td>
                  <td className="center-feature">Tags & Subgêneros</td>
                  <td>{gameB.genres?.join(", ") || "—"}</td>
                </tr>
                <tr>
                  <td>{gameA.store === "both" ? "Steam + Epic" : gameA.store === "epic" ? "Epic Games" : "Steam"}</td>
                  <td className="center-feature">Disponibilidade em Lojas</td>
                  <td>{gameB.store === "both" ? "Steam + Epic" : gameB.store === "epic" ? "Epic Games" : "Steam"}</td>
                </tr>
                <tr>
                  <td>{gameA.inTop100 ? "Sim (#" + gameA.steamRank + ")" : "Não"}</td>
                  <td className="center-feature">Presente no Top 100 Atual</td>
                  <td>{gameB.inTop100 ? "Sim (#" + gameB.steamRank + ")" : "Não"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty">
          <p>Selecione dois jogos válidos para iniciar a comparação.</p>
        </div>
      )}
    </div>
  );
}
