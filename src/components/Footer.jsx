import { Info, SteamLogo } from "@phosphor-icons/react";

export default function Footer({ onHow }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-mark">
            <SteamLogo size={20} weight="fill" />
          </span>
          <span className="brand-name">
            Steam<span className="brand-accent">Two</span>
          </span>
        </div>
        <p className="footer-note">
          Rankings transparentes de popularidade com base na Steam e na Epic Games. Dados de demonstração.
        </p>
        <button className="footer-how" onClick={onHow}>
          <Info size={16} />
          Como calculamos
        </button>
      </div>
    </footer>
  );
}
