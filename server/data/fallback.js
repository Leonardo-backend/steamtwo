// Fallback visual com dados realistas, usado quando o PostgreSQL ainda não
// foi configurado. Cada posição de uma fonte é normalizada por
// 100 × (N − posição + 1) / N. O índice combinado é a média das fontes
// disponíveis. Ausência em uma coleta válida vale zero; se a fonte inteira
// estiver indisponível, ela é excluída do cálculo.

const STEAM_LEAGUE = 100; // tamanho da lista pública de populares da Steam
const EPIC_LEAGUE = 60; // tamanho da lista pública do ranking da Epic (avoid saturação da normalização)

// store: 'steam' | 'epic' | 'both'
// steamRank / epicRank: posição na respectiva lista pública (ou null)
// players: jogadores simultâneos na Steam (fonte: SteamDB/Steam API)
// genres: gêneros usados nos filtros do catálogo
export const games = [
  {
    slug: "counter-strike-2",
    name: "Counter-Strike 2",
    tagline: "O FPS competitivo por excelência.",
    description:
      "Counter-Strike 2 é a maior atualização técnica da história da franquia, construída no motor Source 2. Ray tracing, clipes de fumaça volumétrica e sub-tick refinam o round-based tático que define o gênero há duas décadas.",
    genre: "FPS",
    genres: ["FPS", "Competitivo", "Multijogador"],
    store: "steam",
    storeLink: "https://store.steampowered.com/app/730/",
    steamRank: 1,
    epicRank: null,
    players: 1_928_145,
    color: "#f2a900",
  },
  {
    slug: "elden-ring",
    name: "Elden Ring",
    tagline: "A Terra Entre aguarda por você, Maculado.",
    description:
      "Desenvolvido por FromSoftware em parceria com George R. R. Martin, Elden Ring é uma dark fantasy de mundo aberto em que cada distância guarda uma ameaça. Domine os Fragmentos do Círculo e torne-se o Lorde Prístino.",
    genre: "RPG",
    genres: ["RPG", "Ação", "Mundo aberto"],
    store: "both",
    storeLink: "https://store.steampowered.com/app/1245620/",
    steamRank: 4,
    epicRank: 9,
    players: 96_402,
    color: "#b8a13a",
  },
  {
    slug: "baldurs-gate-3",
    name: "Baldur's Gate 3",
    tagline: "Um RPG de mesa que respeita suas escolhas.",
    description:
      "Baseado em Dungeons & Dragons, Baldur's Gate 3 entrega uma narrativa de ramos profundos, companheiros memoráveis e combate tático por turnos. Cada decisão ecoa até o fim da aventura em Faerûn.",
    genre: "RPG",
    genres: ["RPG", "Tático", "Narrativo"],
    store: "steam",
    storeLink: "https://store.steampowered.com/app/1086940/",
    steamRank: 7,
    epicRank: null,
    players: 71_288,
    color: "#b02a3a",
  },
  {
    slug: "cyberpunk-2077",
    name: "Cyberpunk 2077",
    tagline: "Vire uma lenda em Night City.",
    description:
      "Em Night City, você é V, um mercenário em busca de um chip de imortalidade. O update 2.0 e o expansion Phantom Liberty transformaram o jogo em uma aventura de mundo aberto da qual ninguém escapa impune.",
    genre: "RPG",
    genres: ["RPG", "Ação", "Mundo aberto"],
    store: "both",
    storeLink: "https://store.steampowered.com/app/1091500/",
    steamRank: 11,
    epicRank: 14,
    players: 49_336,
    color: "#fcee0a",
  },
  {
    slug: "the-witcher-3-wild-hunt",
    name: "The Witcher 3: Wild Hunt",
    tagline: "A Caçada Selvagem chegou.",
    description:
      "Geralt de Rívia persegue Ciri em um mundo aberto de dimensões épicas. Missões secundárias dignas de protagonistas, escolhas consequentes e atmosfera inesquecível, agora com o modo next-gen gratuito.",
    genre: "RPG",
    genres: ["RPG", "Ação", "Mundo aberto"],
    store: "both",
    storeLink: "https://store.steampowered.com/app/292030/",
    steamRank: 16,
    epicRank: 18,
    players: 38_912,
    color: "#d8b01a",
  },
  {
    slug: "dota-2",
    name: "Dota 2",
    tagline: "O MOBA que definiu o gênero.",
    description:
      "Dota 2 é o MOBA gratuito que consagrou a arena de batalha 5v5. Com mais de 120 heróis, torneios de milhões e uma comunidade apaixonada, segue um dos jogos mais jogados da Steam.",
    genre: "MOBA",
    genres: ["MOBA", "Competitivo", "Multijogador"],
    store: "steam",
    storeLink: "https://store.steampowered.com/app/570/",
    steamRank: 3,
    epicRank: null,
    players: 482_770,
    color: "#7a3fbf",
  },
  {
    slug: "pubg-battlegrounds",
    name: "PUBG: Battlegrounds",
    tagline: "O battle royale original.",
    description:
      "Pioneiro do gênero battle royale, PUBG coloca 100 jogadores em um mapa cada vez menor. Sorteie, saqueie e sobreviva até ser o último em pé.",
    genre: "Battle Royale",
    genres: ["Battle Royale", "Competitivo", "Multijogador"],
    store: "steam",
    storeLink: "https://store.steampowered.com/app/578080/",
    steamRank: 2,
    epicRank: null,
    players: 612_940,
    color: "#e6a52a",
  },
  {
    slug: "grand-theft-auto-v",
    name: "Grand Theft Auto V",
    tagline: "Três criminosos, um plano ousado.",
    description:
      "Michael, Franklin e Trevor desafiam as autoridades de Los Santos em uma história aberta de assaltos e excessos. O GTA Online segue vivo, com atualizações constantes e milhões de jogadores.",
    genre: "Ação",
    genres: ["Ação", "Mundo aberto", "Multijogador"],
    store: "steam",
    storeLink: "https://store.steampowered.com/app/271590/",
    steamRank: 6,
    epicRank: null,
    players: 126_084,
    color: "#3f7fce",
  },
  {
    slug: "red-dead-redemption-2",
    name: "Red Dead Redemption 2",
    tagline: "O fim do Velho Oeste.",
    description:
      "Arthur Morgan e a gangue Van der Linde fogem das leis em uma América em extinção. Uma das experiências de mundo aberto mais detalhadas já feitas, com multiplayer Red Dead Online.",
    genre: "Ação",
    genres: ["Ação", "Mundo aberto", "Aventura"],
    store: "steam",
    storeLink: "https://store.steampowered.com/app/1174180/",
    steamRank: 14,
    epicRank: null,
    players: 44_672,
    color: "#9a3f2a",
  },
  {
    slug: "fortnite",
    name: "Fortnite",
    tagline: "Construa, lute e vença.",
    description:
      "Fora do alcance da Steam, Fortnite é o battle royale que mistura construção e combate. Eventos ao vivo e crossovers culturais fazem dele um dos maiores fenômenos do mundo.",
    genre: "Battle Royale",
    genres: ["Battle Royale", "Multijogador"],
    store: "epic",
    storeLink: "https://store.epicgames.com/pt-BR/p/fortnite",
    steamRank: null,
    epicRank: 2,
    players: null,
    color: "#4f6fd8",
  },
  {
    slug: "fall-guys",
    name: "Fall Guys",
    tagline: "A corrida dos estranhos.",
    description:
      "A maratona caótica em que corredores gelatinosos atravessam obstáculos insanos. Pode ser terminada por pegar o coroa... ou por um golpe de canhão. Party game viciante e gratuito.",
    genre: "Party",
    genres: ["Party", "Casual", "Multijogador"],
    store: "epic",
    storeLink: "https://store.epicgames.com/pt-BR/p/fall-guys",
    steamRank: null,
    epicRank: 15,
    players: null,
    color: "#e8563a",
  },
  {
    slug: "genshin-impact",
    name: "Genshin Impact",
    tagline: "Explore Teyvat e seus sete elementos.",
    description:
      "Um RPG de mundo aberto com visuais de anime e combate elemental em tempo real. Troque entre personagens, colecione relíquias e descubra os mistérios de Teyvat.",
    genre: "RPG",
    genres: ["RPG", "Ação", "Mundo aberto"],
    store: "epic",
    storeLink: "https://store.epicgames.com/pt-BR/p/genshin-impact",
    steamRank: null,
    epicRank: 8,
    players: null,
    color: "#3fbd9e",
  },
  {
    slug: "apex-legends",
    name: "Apex Legends",
    tagline: "Heróis, habilidades e fogo cerrado.",
    description:
      "O battle royale da Respawn com personagens que possuem habilidades únicas. Movimento fluido, comunicação por pings e competitivo até o fim.",
    genre: "FPS",
    genres: ["FPS", "Battle Royale", "Competitivo"],
    store: "steam",
    storeLink: "https://store.steampowered.com/app/1172470/",
    steamRank: 8,
    epicRank: null,
    players: 138_515,
    color: "#c0342a",
  },
  {
    slug: "helldivers-2",
    name: "Helldivers 2",
    tagline: "Pela Superterra. Pela democracia.",
    description:
      "Traga a democracia a Marte num cooperativo de tiro em que cada erro seu é fatal para o time. Estrategias orbitais, hosts alienígenas e a maior vitória da Superterra.",
    genre: "Tiro",
    genres: ["Tiro", "Co-op", "Multijogador"],
    store: "steam",
    storeLink: "https://store.steampowered.com/app/553850/",
    steamRank: 12,
    epicRank: null,
    players: 60_901,
    color: "#c9c922",
  },
];

// Normalização 100 × (N − pos + 1) / N
export const normalize = (position, leagueSize) =>
  position == null ? 0 : Math.round((100 * (leagueSize - position + 1)) / leagueSize);

export function scoreFor(game) {
  const steam = game.steamRank != null ? normalize(game.steamRank, STEAM_LEAGUE) : 0;
  const epic = game.epicRank != null ? normalize(game.epicRank, EPIC_LEAGUE) : 0;
  const available = (game.steamRank != null ? 1 : 0) + (game.epicRank != null ? 1 : 0);
  const combined = available ? Math.round((steam + epic) / available) : 0;
  return { steam, epic, available, combined };
}

// Pequena variação para simular a série histórica semanal (última semana) e o
// índice de popularidade histórica (de sempre), derivados da IGDB.
const WEEKLY_DRIFT = {
  "counter-strike-2": +2,
  "baldurs-gate-3": +5,
  "helldivers-2": -3,
  "the-witcher-3-wild-hunt": -1,
  "cyberpunk-2077": +4,
  "fall-guys": -6,
  "dota-2": +1,
  "red-dead-redemption-2": -2,
};

const HISTORICAL = {
  "counter-strike-2": 97,
  "dota-2": 92,
  "grand-theft-auto-v": 94,
  "pubg-battlegrounds": 89,
  "fortnite": 95,
  "the-witcher-3-wild-hunt": 90,
  "elden-ring": 88,
  "cyberpunk-2077": 85,
  "apex-legends": 81,
  "red-dead-redemption-2": 84,
  "baldurs-gate-3": 87,
  "genshin-impact": 86,
  "helldivers-2": 78,
  "fall-guys": 72,
};

function clamp(v, min = 1, max = 100) {
  return Math.max(min, Math.min(max, Math.round(v)));
}

export function computeDashboard() {
  const now = games
    .map((g) => {
      const { combined } = scoreFor(g);
      return { slug: g.slug, name: g.name, genre: g.genre, index: combined, players: g.players };
    })
    .sort((a, b) => b.index - a.index)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  const hero = games.find((g) => g.slug === "elden-ring");

  // Última semana: média de 7 snapshots diários válidos, simulado com drift.
  const lastWeek = now
    .map((r) => {
      const drift = WEEKLY_DRIFT[r.slug] ?? 0;
      const jitter = ((r.slug.length * 13) % 7) - 3;
      return { ...r, index: clamp(r.index + drift + jitter) };
    })
    .sort((a, b) => b.index - a.index)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  // De sempre: proxy de popularidade histórica da IGDB.
  const allTime = now
    .map((r) => ({ ...r, index: HISTORICAL[r.slug] ?? clamp(r.index) }))
    .sort((a, b) => b.index - a.index)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  const top5 = now.slice(0, 5);
  const record = { ...now[0], value: 98, date: "monitorado desde o início da coleta" };

  const sources = [
    { id: "steam", name: "Steam", available: true, leagueSize: STEAM_LEAGUE, count: games.filter((g) => g.steamRank != null).length },
    { id: "epic", name: "Epic Games", available: true, leagueSize: EPIC_LEAGUE, count: games.filter((g) => g.epicRank != null).length },
    { id: "igdb", name: "IGDB (de sempre)", available: true, leagueSize: null, count: games.length },
  ];

  return {
    hero: {
      slug: hero.slug,
      name: hero.name,
      genre: hero.genre,
      genres: hero.genres,
      description: hero.description,
      tagline: hero.tagline,
      storeLink: hero.storeLink,
      store: hero.store,
      nowIndex: now.find((r) => r.slug === hero.slug).index,
      players: hero.players,
    },
    now,
    lastWeek,
    allTime,
    top5,
    record,
    sources,
    updatedAt: new Date().toISOString(),
  };
}

// Dados expostos no catálogo / api/games
export function catalogView(game) {
  const { combined } = scoreFor(game);
  return {
    slug: game.slug,
    name: game.name,
    tagline: game.tagline,
    genre: game.genre,
    genres: game.genres,
    store: game.store,
    storeLink: game.storeLink,
    color: game.color,
    index: combined,
    steamRank: game.steamRank,
    epicRank: game.epicRank,
    players: game.players,
  };
}

export function detailView(game) {
  const { steam, epic, combined, available } = scoreFor(game);
  return {
    slug: game.slug,
    name: game.name,
    tagline: game.tagline,
    description: game.description,
    genre: game.genre,
    genres: game.genres,
    store: game.store,
    storeLink: game.storeLink,
    color: game.color,
    index: combined,
    availability: available,
    breakdown: [
      { key: "steam", label: "Steam", score: steam, rank: game.steamRank, present: game.steamRank != null },
      { key: "epic", label: "Epic Games", score: epic, rank: game.epicRank, present: game.epicRank != null },
    ],
    players: game.players,
    historical: HISTORICAL[game.slug] ?? combined,
  };
}
