import { useEffect, useState } from "react";
import {
  Fire,
  CalendarBlank,
  Trophy,
  ChartLineUp,
  Storefront,
  HardDrives,
  ArrowUpRight,
  Database,
  ArrowsLeftRight,
  Funnel,
  Heart,
  ArrowRight,
  CheckCircle,
} from "@phosphor-icons/react";
import { getDashboard, getStats } from "../api.js";
import heroImg from "../assets/hero-elden.jpg";
import RankRow from "../components/RankRow.jsx";
import Top5Card from "../components/Top5Card.jsx";
import LiveBadge from "../components/LiveBadge.jsx";
import Sparkline from "../components/Sparkline.jsx";
import Loading from "../components/Loading.jsx";

const fmt = (n) => (n == null ? "—" : Math.round(n).toLocaleString("pt-BR"));

export default function Dashboard({ navigate, openHow, favorites = [], toggleFavorite, isFavorite }) {
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([getDashboard(), getStats()]).then(([d, s]) => {
      if (alive) {
        setData(d);
        setStats(s);
      }
    });
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
            {hero.slug && isFavorite && (
              <button
                className={"hero-fav-btn" + (isFavorite(hero.slug) ? " active" : "")}
                onClick={() => toggleFavorite(hero)}
                aria-label="Favoritar jogo em destaque"
              >
                <Heart size={16} weight={isFavorite(hero.slug) ? "fill" : "regular"} />
                <span>{isFavorite(hero.slug) ? "Na minha lista" : "Salvar na lista"}</span>
              </button>
            )}
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

      {/* Widget de Métricas do Sistema & Conexão PostgreSQL */}
      {stats && (
        <section className="section stats-banner-section">
          <div className="stats-banner-card">
            <div className="stat-item">
              <span className="stat-item-label">
                <Database size={16} /> Banco de Dados
              </span>
              <span className="stat-item-value">
                {stats.db === "postgres" ? (
                  <span className="db-connected-tag">
                    <CheckCircle size={15} weight="fill" /> PostgreSQL Conectado
                  </span>
                ) : (
                  <span className="db-fallback-tag">⚡ Modo Fallback / Offline</span>
                )}
              </span>
            </div>

            <div className="stat-item">
              <span className="stat-item-label">📊 Jogos Monitorados</span>
              <span className="stat-item-value highlight">{stats.gamesTotal} títulos</span>
            </div>

            <div className="stat-item">
              <span className="stat-item-label">📸 Snapshots Históricos</span>
              <span className="stat-item-value highlight">{stats.snapshotsTotal} coletas</span>
            </div>

            <div className="stat-item">
              <span className="stat-item-label">🕒 Última Sincronização</span>
              <span className="stat-item-value">
                {stats.lastSync ? new Date(stats.lastSync).toLocaleDateString("pt-BR") : "Hoje"}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Atalhos Rápidos para Novas Funcionalidades */}
      <section className="section feature-shortcuts-section">
        <div className="feature-cards-grid">
          <button className="feature-shortcut-card" onClick={() => navigate("/rankings")}>
            <div className="feat-icon trophy-icon">
              <Trophy size={24} weight="fill" />
            </div>
            <div className="feat-text">
              <h3>Rankings Oficiais</h3>
              <p>Classificação comparativa com filtros por período e loja.</p>
            </div>
            <ArrowRight size={18} className="feat-arrow" />
          </button>

          <button className="feature-shortcut-card" onClick={() => navigate("/generos")}>
            <div className="feat-icon funnel-icon">
              <Funnel size={24} weight="fill" />
            </div>
            <div className="feat-text">
              <h3>Explorar Gêneros</h3>
              <p>Descubra os líderes em RPG, FPS, MOBA, Ação e mais.</p>
            </div>
            <ArrowRight size={18} className="feat-arrow" />
          </button>

          <button className="feature-shortcut-card" onClick={() => navigate("/comparar")}>
            <div className="feat-icon compare-icon">
              <ArrowsLeftRight size={24} weight="fill" />
            </div>
            <div className="feat-text">
              <h3>Comparador de Jogos</h3>
              <p>Duelo estatístico lado a lado com barras visuais.</p>
            </div>
            <ArrowRight size={18} className="feat-arrow" />
          </button>
        </div>
      </section>

      {/* Faixa top 5 — agora */}
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
