import { useEffect, useRef } from "react";
import { X, ChartLineUp, CalendarBlank, Trophy, Fire } from "@phosphor-icons/react";

const RULES = [
  {
    icon: Fire,
    title: "Agora",
    text: "Último snapshot válido da Steam e da Epic Games, com os jogadores simultâneos quando disponíveis.",
  },
  {
    icon: CalendarBlank,
    title: "Última semana",
    text: "Média de sete snapshots diários válidos, suavizando picos e quedas instantâneas.",
  },
  {
    icon: Trophy,
    title: "De sempre",
    text: "Proxy do pico de jogadores simultâneos da Steam. Não representa horas jogadas.",
  },
  {
    icon: ChartLineUp,
    title: "Recorde monitorado",
    text: "Maior índice registrado desde o início da coleta de dados.",
  },
];

export default function HowItWorksModal({ open, onClose }) {
  const dialogRef = useRef(null);
  const lastFocus = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    lastFocus.current = document.activeElement;
    const dialog = dialogRef.current;
    dialog?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (lastFocus.current && typeof lastFocus.current.focus === "function") {
        lastFocus.current.focus();
      }
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key !== "Tab") return;
      const focusables = dialogRef.current?.querySelectorAll("button, [href], input, [tabindex]:not([tabindex='-1'])");
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2 id="how-title">Como calculamos</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <p className="modal-intro">
          Os dados de jogadores e posição são coletados <strong>ao vivo da Steam</strong> (top público de
          jogadores simultâneos). Cada posição de uma fonte é normalizada por{" "}
          <code>100 × (N − posição + 1) / N</code>, e o índice combinado é a média das fontes disponíveis.
          Ausência em uma coleta válida vale zero; se a fonte inteira estiver indisponível, ela é excluída
          do cálculo (como a Epic, que não publica contagem de jogadores).
        </p>

        <div className="rules">
          {RULES.map((r) => (
            <div className="rule" key={r.title}>
              <span className="rule-icon">
                <r.icon size={22} weight="fill" />
              </span>
              <div>
                <h3>{r.title}</h3>
                <p>{r.text}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="modal-foot-note">
          A Steam fornece posição e jogadores simultâneos por API pública. A Epic não publica contagem de
          jogadores, então essa fonte é excluída do índice (quando a coleta oficial é bloqueada, o job usa
          o ranking público <code>egdata</code> e marca o provedor como <code>egdata-fallback</code>).
        </p>
      </div>
    </div>
  );
}
