import { useEffect, useState } from "react";
import { Fire, CalendarBlank, Trophy, ChartLineUp, Storefront, HardDrives, ArrowUpRight } from "@phosphor-icons/react";
import { getDashboard } from "../api.js";
import heroImg from "../assets/hero-elden.jpg";
import RankRow from "../components/RankRow.jsx";
import Top5Card from "../components/Top5Card.jsx";
import LiveBadge from "../components/LiveBadge.jsx";
import Sparkline from "../components/Sparkline.jsx";
import Loading from "../components/Loading.jsx";

const fmt = (n) => (n == null ? "—" : Math.round(n).toLocaleString("pt-BR"));

export default function Dashboard({ navigate, openHow }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    getDashboard().then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, []);

  if (!data) {
    return <Loading label="Carregando dashboard…" />;
  }

  const { hero, now, lastWeek, allTime, top5, record, sources } = data;
  const go = (slug) => navigate(`/jogos/${slug}`);
  const live = data.live;

  return (
    <div className="dashboard">
      {/* Hero cinematográfico */}
      <section className="hero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="hero-scrim" />
        <div className="hero-content">
          <span className="hero-kicker">
            <Fire size={16} weight="fill" /> Em destaque
          </span>
          <div className="hero-badge-row">
            <LiveBadge live={live} />
          </div>
          <h1 className="hero-title">{hero.name}</h1>
          <p className="hero-tagline">{hero.tagline}</p>
          <p className="hero-desc">{hero.description}</p>
          <div className="hero-meta">
            {hero.nowIndex != null && (
              <span className="hero-stat">
                <span className="stat-label">Índice agora</span>
                <span className="stat-value accent">{hero.nowIndex}</span>
              </span>
            )}
            {hero.players != null && (
              <span className="hero-stat">
                <span className="stat-label">Jogando agora (Steam)</span>
                <span className="stat-value">{fmt(hero.players)}</span>
              </span>
            )}
            <span className="hero-stat">
              <span className="stat-label">Posição no top 100</span>
              <span className="stat-value">{hero.rank != null ? `#${hero.rank}` : "—"}</span>
            </span>
            <span className="hero-stat">
              <span className="stat-label">Gênero</span>
              <span className="stat-value">{hero.genre}</span>
            </span>
          </div>
          <div className="hero-actions">
            <button className="cta" onClick={() => go(hero.slug)}>
              <span>Ver detalhes</span>
            </button>
            <a className="cta ghost" href={hero.storeLink} target="_blank" rel="noreferrer">
              <Storefront size={18} />
              <span>Loja oficial</span>
            </a>
          </div>
        </div>
      </section>

      {/* Faixa top 5 — agoraz */}
      <section className="section">
        <div className="section-head">
          <h2>
            <Fire size={20} weight="fill" /> Mais jogados agora
          </h2>
          <button className="text-btn" onClick={() => navigate("/jogos")}>
            Ver catálogo completo
          </button>
        </div>
        <div className="top5-strip">
          {top5.map((item) => (
            <Top5Card key={item.slug} item={item} onClick={go} />
          ))}
        </div>
      </section>

      {/* Colunas última semana / de sempre + recorde */}
      <section className="section columns-section">
        <div className="rank-columns">
          <div className="rank-column">
            <div className="column-head">
              <CalendarBlank size={20} weight="fill" />
              <h3>Última semana</h3>
            </div>
            <div className="rank-list">
              {lastWeek.slice(0, 7).map((item) => (
                <RankRow key={item.slug} item={item} onClick={go} kind="lastWeek" />
              ))}
            </div>
          </div>

          <div className="rank-column">
            <div className="column-head">
              <Trophy size={20} weight="fill" />
              <h3>De sempre</h3>
            </div>
            <div className="rank-list">
              {allTime.slice(0, 7).map((item) => (
                <RankRow key={item.slug} item={item} onClick={go} kind="allTime" />
              ))}
            </div>
          </div>
        </div>

        <div className="record-card">
          <div className="record-head">
            <span className="record-icon">
              <ChartLineUp size={24} weight="fill" />
            </span>
            <div>
              <h3>Recorde monitorado</h3>
              <p>{record.date}</p>
            </div>
          </div>
          <div className="record-body">
            <div className="record-champ">
              <span className="record-rank">#1</span>
              <div>
                <span className="record-name">{record.name}</span>
                <span className="record-sub">Índice máximo registrado</span>
              </div>
            </div>
            <span className="record-value">{record.value}</span>
          </div>
          <div className="record-chart">
            <span className="record-chart-label">Evolução diária do índice</span>
            <Sparkline values={(record.history || []).map((h) => h.index)} width={220} height={40} />
          </div>
          <a className="record-link" href={`/jogos/${record.slug}`} onClick={(e) => { e.preventDefault(); go(record.slug); }}>
            Ver histórico <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

      {/* Transparência / fontes */}
      <section className="section sources-section">
        <div className="section-head">
          <h2>
            <HardDrives size={20} weight="fill" /> Fontes do índice
          </h2>
          <button className="text-btn" onClick={openHow}>
            Entender o cálculo
          </button>
        </div>
        <div className="source-grid">
          {sources.map((s) => (
            <div className="source-card" key={s.id}>
              <span className="source-name">
                {s.name} <span className={"status-dot " + (s.available ? "on" : "off")} />
              </span>
              <span className="source-meta">
                {s.available ? `disponível ao vivo · ${s.count} jogos` : s.note || "indisponível"}
              </span>
            </div>
          ))}
        </div>
        {data.nonGames?.length > 0 && (
          <p className="exclusion-note">
            O ranking de jogos exclui apps/plataformas que não são jogos da Steam ({data.nonGames
              .map((g) => g.name)
              .join(", ")}).
          </p>
        )}
      </section>
    </div>
  );
}
