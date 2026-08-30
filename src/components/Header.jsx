import { GameController, Info, MagnifyingGlass } from "@phosphor-icons/react";

export default function Header({ overHero, navigate, onHow, current }) {
  const link = (to, label) => {
    const active = (current === "home" && to === "/") || (current !== "home" && to === "/jogos");
    return (
      <button className={"nav-link" + (active ? " active" : "")} onClick={() => navigate(to)}>
        {label}
      </button>
    );
  };

  return (
    <header className={"site-header" + (overHero ? " over-hero" : "")}>
      <div className="header-inner">
        <button className="brand" onClick={() => navigate("/")} aria-label="SteamTwo — ir para o início">
          <span className="brand-mark">
            <GameController size={22} weight="fill" />
          </span>
          <span className="brand-name">
            Steam<span className="brand-accent">Two</span>
          </span>
        </button>

        <nav className="nav">
          {link("/", "Início")}
          {link("/jogos", "Catálogo")}
        </nav>

        <div className="header-actions">
          <button className="icon-btn" aria-label="Buscar no catálogo" onClick={() => navigate("/jogos")}>
            <MagnifyingGlass size={20} />
          </button>
          <button className="how-btn" onClick={onHow}>
            <Info size={18} />
            <span>Como calculamos</span>
          </button>
        </div>
      </div>
    </header>
  );
}
