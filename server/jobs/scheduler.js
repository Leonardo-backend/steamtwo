// Agendador de snapshots: garante UM snapshot por dia (métrica "última semana").
// Roda na inicialização e verifica a cada 60 min se o snapshot do dia já existe.

import { ensureDailySnapshot } from "../real-dashboard.js";

const CHECK_INTERVAL = 60 * 60 * 1000;
let started = false;

export function startSnapshotScheduler({ log = console } = {}) {
  if (started) return;
  started = true;

  const run = async () => {
    try {
      const saved = await ensureDailySnapshot();
      if (saved) log?.log("[steamtwo] snapshot diário salvo");
    } catch (e) {
      log?.error("[steamtwo] falha ao salvar snapshot:", e.message);
    }
  };

  run();
  const timer = setInterval(run, CHECK_INTERVAL);
  if (typeof timer.unref === "function") timer.unref();
}
