// Normaliza gêneros da Steam (inglês) para o vocabulário PT usado no catálogo.

const GENRE_MAP = {
  fps: "FPS",
  rts: "RTS",
  tps: "TPS",
  rpg: "RPG",
  mmo: "MMO",
  mmorpg: "MMORPG",
  moba: "MOBA",
  vr: "VR",
  action: "Ação",
  adventure: "Aventura",
  "rpg": "RPG",
  "role-playing": "RPG",
  "role playing": "RPG",
  "strategy": "Estratégia",
  casual: "Casual",
  indie: "Indie",
  simulation: "Simulação",
  sim: "Simulação",
  sports: "Esporte",
  racing: "Corrida",
  "massively multiplayer": "MMO",
  "massively multi-player": "MMO",
  "mmo": "MMO",
  "mmorpg": "MMORPG",
  "early access": "Acesso Antecipado",
  "free to play": "Gratuito",
  "free-to-play": "Gratuito",
  shooter: "Tiro",
  "action-adventure": "Ação-Aventura",
  "action adventure": "Ação-Aventura",
  fighting: "Luta",
  puzzle: "Quebra-cabeça",
  platformer: "Plataforma",
  "battle royale": "Battle Royale",
  "moba": "MOBA",
  party: "Party",
  "co-op": "Co-op",
  "co-op multiplayer": "Co-op",
  "singleplayer": "Singleplayer",
  "multiplayer": "Multijogador",
};

export function normalizeGenre(genre) {
  if (!genre) return "Outros";
  const key = String(genre).trim().toLowerCase();
  if (GENRE_MAP[key]) return GENRE_MAP[key];
  // Title-case por palavra (split evita quebrar acentos: 'ação' → 'Ação').
  return key
    .split(/(\s+|[-&/])/)
    .map((w) => (w && /^[a-z0-9]/.test(w) ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join("");
}

export function normalizeGenres(genres) {
  const arr = (genres || [])
    .map((g) => String(g || "").trim())
    .filter((g) => g.length > 0)
    .map(normalizeGenre);
  return [...new Set(arr)];
}
