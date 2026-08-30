// Fallback do cliente: mesma modelagem realista do servidor, usada quando a
// API não está disponível (ex.: sem PostgreSQL, modo offline de preview).

const L = (s) => Math.round((100 * (100 - s + 1)) / 100);
const Le = (e) => Math.round((100 * (60 - e + 1)) / 60);
const clamp = (v) => Math.max(1, Math.min(100, Math.round(v)));

const GAMES = [
  { slug: "counter-strike-2", name: "Counter-Strike 2", genre: "FPS", store: "steam", color: "#f2a900", s: 1, e: null, p: 1928145, tagline: "O FPS competitivo por excelência." },
  { slug: "elden-ring", name: "Elden Ring", genre: "RPG", store: "both", color: "#b8a13a", s: 4, e: 9, p: 96402, tagline: "A Terra Entre aguarda por você, Maculado." },
  { slug: "baldurs-gate-3", name: "Baldur's Gate 3", genre: "RPG", store: "steam", color: "#b02a3a", s: 7, e: null, p: 71288, tagline: "Um RPG de mesa que respeita suas escolhas." },
  { slug: "cyberpunk-2077", name: "Cyberpunk 2077", genre: "RPG", store: "both", color: "#fcee0a", s: 11, e: 14, p: 49336, tagline: "Vire uma lenda em Night City." },
  { slug: "the-witcher-3-wild-hunt", name: "The Witcher 3: Wild Hunt", genre: "RPG", store: "both", color: "#d8b01a", s: 16, e: 18, p: 38912, tagline: "A Caçada Selvagem chegou." },
  { slug: "dota-2", name: "Dota 2", genre: "MOBA", store: "steam", color: "#7a3fbf", s: 3, e: null, p: 482770, tagline: "O MOBA que definiu o gênero." },
  { slug: "pubg-battlegrounds", name: "PUBG: Battlegrounds", genre: "Battle Royale", store: "steam", color: "#e6a52a", s: 2, e: null, p: 612940, tagline: "O battle royale original." },
  { slug: "grand-theft-auto-v", name: "Grand Theft Auto V", genre: "Ação", store: "steam", color: "#3f7fce", s: 6, e: null, p: 126084, tagline: "Três criminosos, um plano ousado." },
  { slug: "red-dead-redemption-2", name: "Red Dead Redemption 2", genre: "Ação", store: "steam", color: "#9a3f2a", s: 14, e: null, p: 44672, tagline: "O fim do Velho Oeste." },
  { slug: "fortnite", name: "Fortnite", genre: "Battle Royale", store: "epic", color: "#4f6fd8", s: null, e: 2, p: null, tagline: "Construa, lute e vença." },
  { slug: "fall-guys", name: "Fall Guys", genre: "Party", store: "epic", color: "#e8563a", s: null, e: 15, p: null, tagline: "A corrida dos estranhos." },
  { slug: "genshin-impact", name: "Genshin Impact", genre: "RPG", store: "epic", color: "#3fbd9e", s: null, e: 8, p: null, tagline: "Explore Teyvat e seus sete elementos." },
  { slug: "apex-legends", name: "Apex Legends", genre: "FPS", store: "steam", color: "#c0342a", s: 8, e: null, p: 138515, tagline: "Heróis, habilidades e fogo cerrado." },
  { slug: "helldivers-2", name: "Helldivers 2", genre: "Tiro", store: "steam", color: "#c9c922", s: 12, e: null, p: 60901, tagline: "Pela Superterra. Pela democracia." },
];

const score = (g) => {
  const st = g.s != null ? L(g.s) : 0;
  const ep = g.e != null ? Le(g.e) : 0;
  const n = (g.s != null ? 1 : 0) + (g.e != null ? 1 : 0);
  return { st, ep, n, c: n ? Math.round((st + ep) / n) : 0 };
};

const HIST = {
  "counter-strike-2": 97, dota: 92, "grand-theft-auto-v": 94, "pubg-battlegrounds": 89,
  fortnite: 95, "the-witcher-3-wild-hunt": 90, "elden-ring": 88, "cyberpunk-2077": 85,
  "apex-legends": 81, "red-dead-redemption-2": 84, "baldurs-gate-3": 87,
  "genshin-impact": 86, "helldivers-2": 78, "fall-guys": 72,
};

export function fallbackDashboard() {
  const now = GAMES
    .map((g) => ({ slug: g.slug, name: g.name, genre: g.genre, color: g.color, index: score(g).c, players: g.p }))
    .sort((a, b) => b.index - a.index)
    .map((r, i) => ({ ...r, rank: i + 1 }));
  const lastWeek = now
    .map((r) => ({ ...r, index: clamp(r.index + ((r.slug.length * 13) % 7) - 3) }))
    .sort((a, b) => b.index - a.index)
    .map((r, i) => ({ ...r, rank: i + 1 }));
  const allTime = now
    .map((r) => ({ ...r, index: HIST[r.slug] || r.index, color: r.color }))
    .sort((a, b) => b.index - a.index)
    .map((r, i) => ({ ...r, rank: i + 1 }));
  const hero = GAMES.find((g) => g.slug === "elden-ring");
  return {
    hero: {
      slug: hero.slug, name: hero.name, genre: hero.genre, tagline: hero.tagline,
      description: "A Terra Entre aguarda por você, Maculado. Desenvolvido por FromSoftware em parceria com George R. R. Martin, Elden Ring é uma dark fantasy de mundo aberto em que cada distância guarda uma ameaça.",
      store: hero.store, storeLink: "https://store.steampowered.com/app/1245620/",
      nowIndex: now.find((r) => r.slug === hero.slug).index, players: hero.p,
    },
    now, lastWeek, allTime, top5: now.slice(0, 5),
    record: { ...now[0], value: 98 },
    sources: [
      { id: "steam", name: "Steam", available: true, leagueSize: 100, count: 11 },
      { id: "epic", name: "Epic Games", available: true, leagueSize: 250, count: 6 },
      { id: "igdb", name: "IGDB (de sempre)", available: true, leagueSize: null, count: 14 },
    ],
    updatedAt: new Date().toISOString(),
  };
}

export function fallbackCatalog(query = {}) {
  const { q = "", store = "", genre = "" } = query;
  let list = GAMES;
  if (store === "steam") list = list.filter((g) => g.store !== "epic");
  else if (store === "epic") list = list.filter((g) => g.store !== "steam");
  else if (store === "both") list = list.filter((g) => g.store === "both");
  if (genre) list = list.filter((g) => g.genre === genre);
  if (q) {
    const n = String(q).toLowerCase();
    list = list.filter((g) => g.name.toLowerCase().includes(n) || g.tagline.toLowerCase().includes(n));
  }
  const items = list
    .map((g) => ({ slug: g.slug, name: g.name, tagline: g.tagline, genre: g.genre, colors: g.color, store: g.store, color: g.color, index: score(g).c, players: g.p }))
    .sort((a, b) => b.index - a.index)
    .map((v, i) => ({ ...v, rank: i + 1 }));
  return { items, total: items.length, genres: [...new Set(GAMES.map((g) => g.genre))].sort() };
}

export function fallbackDetail(slug) {
  const g = GAMES.find((x) => x.slug === slug);
  if (!g) throw new Error("not found");
  const { st, ep, c, n } = score(g);
  return {
    slug: g.slug, name: g.name, tagline: g.tagline, genre: g.genre, store: g.store,
    storeLink: g.store ? (g.store === "epic" ? `https://store.epicgames.com/p/${slug.replace(/-/g, "-")}` : `https://store.steampowered.com/app/1245620/`) : "",
    color: g.color, index: c, availability: n, players: g.p,
    historical: HIST[slug] || c,
    description: "Descrição detalhada disponível na página oficial da loja.",
    breakdown: [
      { key: "steam", label: "Steam", score: st, rank: g.s, present: g.s != null },
      { key: "epic", label: "Epic Games", score: ep, rank: g.e, present: g.e != null },
    ],
  };
}
