import { useEffect, useState } from "react";
import { ArrowLeft, Storefront, SteamLogo, Trophy, ChartLineUp, HardDrive } from "@phosphor-icons/react";
import { getGame } from "../api.js";
import GameCover from "../components/GameCover.jsx";
import { covers } from "../covers.js";
import Loading from "../components/Loading.jsx";

const fmt = (n) => (n == null ? "—" : Math.round(n).toLocaleString("pt-BR"));

export default function Detail({ slug, navigate }) {
  const [game, setGame] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let alive = true;
    getGame(slug)
      .then((g) => {
        if (!alive) return;
        if (g && g.slug) setGame(g);
        else setNotFound(true);
      })
      .catch(() => alive && setNotFound(true));
    return () => {
      alive = false;
    };
  }, [slug]);

  if (notFound) {
    return (
      <div className="page-shell empty">
        <p>Jogo não encontrado.</p>
        <button className="cta" onClick={() => navigate("/jogos")}>Voltar ao catálogo</button>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="page-shell">
        <Loading label="Carregando detalhes…" />
      </div>
    );
  }

  const STORE_LABEL = { steam: "Steam", epic: "Epic Games", both: "Steam + Epic" };
  const storeIcon = game.store === "epic" ? <Storefront size={20} weight="fill" /> : <SteamLogo size={20} weight="fill" />;

  return (
    <div className="detail">
      <div className="detail-banner" style={{ backgroundColor: game.color, backgroundImage: covers[game.slug] ? `url(${covers[game.slug]})` : undefined }}>
        <div className="detail-banner-scrim" />
        <div className="page-shell detail-top">
          <button className="back" onClick={() => navigate("/jogos")}>
            <ArrowLeft size={18} /> Voltar ao catálogo
          </button>
          <div className="detail-title">
            <div className="detail-thumb">
              <GameCover slug={game.slug} name={game.name} color="rgba(255,255,255,0.16)" />
            </div>
            <div>
              <span className="detail-genre">{game.genre}</span>
              <h1>{game.name}</h1>
              <p className="detail-tagline">{game.tagline}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-shell detail-body">
        <div className="detail-main">
          <p className="detail-desc">{game.description}</p>

          <div className="detail-genres">
            {game.genres?.map((g) => (
              <span key={g} className="tag">{g}</span>
            ))}
          </div>

          <div className="detail-row">
            {game.players != null && (
              <div className="data-card">
                <span className="data-label">Jogando agora (Steam)</span>
                <span className="data-value">{fmt(game.players)}</span>
              </div>
            )}
            <div className="data-card">
              <span className="data-label">Índice agora</span>
              <span className="data-value accent">{game.inTop100 ? game.index : "—"}</span>
            </div>
            <div className="data-card">
              <span className="data-label">De sempre</span>
              <span className="data-value">{game.historical != null ? game.historical : "—"}</span>
            </div>
          </div>

          <h3 className="detail-h3">
            <ChartLineUp size={20} weight="fill" /> Composição do índice
          </h3>
          <div className="breakdown">
            {game.breakdown.map((b) => (
              <div className="breakdown-row" key={b.key}>
                <span className="bd-label">{b.label}</span>
                <div className="bd-bar">
                  <div
                    className="bd-fill"
                    style={{ width: `${b.present ? Math.max(2, b.score) : 0}%`, backgroundColor: game.color }}
                  />
                </div>
                <span className="bd-score">{b.present ? b.score : "—"}</span>
                <span className="bd-rank">{b.present ? `#${b.rank}` : "sem fonte"}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="detail-aside">
          <div className="info-card">
            <div className="info-card-head">
              <HardDrive size={18} weight="fill" />
              <span>Fonte</span>
            </div>
            <p className="info-store">
              {storeIcon} {STORE_LABEL[game.store]}
            </p>
            <p className="info-note">
              Dados de jogadores e posição coletados ao vivo da Steam. O índice combina as fontes em que o
              jogo aparece — a Epic não publica contagem de jogadores, por isso é excluída do índice.
            </p>
            <a className="cta full" href={game.storeLink} target="_blank" rel="noreferrer">
              <Trophy size={18} />
              <span>Abrir na loja</span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
