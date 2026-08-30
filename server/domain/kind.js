// Classifica apps da Steam entre jogos e "não-jogos" (mods, apps, plataformas).
// Um conjunto pequeno e curado de appids conhecidos + heurística por nome/slug.

// Palworld (1623730) é um jogo real — NÃO está na lista.
const NON_GAME_APPIDS = new Set([
  2676230, // FiveM (mod/framework do GTA V)
  3419430, // Bongo Cat (app de gesto/som)
  4001890, // How to Fish (app de relaxamento/áudio)
  431960, // Wallpaper Engine (app de papel de parede/animação)
]);

// Heurística por nome: apps conhecidos, mods, softwares de utilidade.
const NON_GAME_NAMES = [
  "wallpaper engine",
  "bongo cat",
  "how to fish",
  "fivem",
];

export function isGame({ appid, name, slug }) {
  const id = appid != null ? String(appid) : "";
  if (NON_GAME_APPIDS.has(Number(id))) return false;
  const n = (name || "").toLowerCase();
  const s = (slug || "").toLowerCase();
  const idSlug = `steam-${id}`;
  if (NON_GAME_NAMES.includes(n)) return false;
  if (s === idSlug && (!n || /advertising|app|music|video|software/i.test(name || ""))) return false;
  return true;
}

// Retorna o motivo da exclusão (para exibir na UI com transparência).
export function nonGameReason({ appid, name }) {
  const id = Number(appid);
  const n = (name || "").toLowerCase();
  if (id === 2676230) return "mod/framework multiplayer do GTA V (não é um jogo da Steam)";
  if (id === 3419430) return "app de gesto/som (não é um jogo)";
  if (id === 4001890) return "app de relaxamento/áudio (não é um jogo)";
  if (n.includes("wallpaper")) return "app de papel de parede/animação (não é um jogo)";
  return "app ou mod — não é um jogo";
}
