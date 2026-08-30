// Metadados curados do catálogo SteimTwo. Os appids correspondem a jogos reais
// da Steam; os dados de ranking/jogadores são coletados ao vivo. Jogos da Epic
// (sem contar público de jogadores) ficam com appid null.

export const GAMES = [
  { slug: "counter-strike-2", name: "Counter-Strike 2", appid: 730, genre: "FPS", genres: ["FPS", "Competitivo", "Multijogador"], store: "steam", color: "#c9901f", tagline: "O FPS competitivo por excelência.", storeLink: "https://store.steampowered.com/app/730/" },
  { slug: "dota-2", name: "Dota 2", appid: 570, genre: "MOBA", genres: ["MOBA", "Competitivo", "Multijogador"], store: "steam", color: "#7a3fbf", tagline: "O MOBA que definiu o gênero.", storeLink: "https://store.steampowered.com/app/570/" },
  { slug: "pubg-battlegrounds", name: "PUBG: Battlegrounds", appid: 578080, genre: "Battle Royale", genres: ["Battle Royale", "Competitivo", "Multijogador"], store: "steam", color: "#c98a20", tagline: "O battle royale original.", storeLink: "https://store.steampowered.com/app/578080/" },
  { slug: "apex-legends", name: "Apex Legends", appid: 1172470, genre: "FPS", genres: ["FPS", "Battle Royale", "Competitivo"], store: "steam", color: "#c0342a", tagline: "Heróis, habilidades e fogo cerrado.", storeLink: "https://store.steampowered.com/app/1172470/" },
  { slug: "helldivers-2", name: "Helldivers 2", appid: 553850, genre: "Tiro", genres: ["Tiro", "Co-op", "Multijogador"], store: "steam", color: "#c9c922", tagline: "Pela Superterra. Pela democracia.", storeLink: "https://store.steampowered.com/app/553850/" },
  { slug: "elden-ring", name: "Elden Ring", appid: 1245620, genre: "RPG", genres: ["RPG", "Ação", "Mundo aberto"], store: "steam", color: "#b8a13a", tagline: "A Terra Entre aguarda por você, Maculado.", storeLink: "https://store.steampowered.com/app/1245620/", description: "Criado por FromSoftware em parceria com George R. R. Martin, Elden Ring é uma dark fantasy de mundo aberto em que cada distância guarda uma ameaça. Domine os Fragmentos do Círculo e torne-se o Lorde Prístino." },
  { slug: "baldurs-gate-3", name: "Baldur's Gate 3", appid: 1086940, genre: "RPG", genres: ["RPG", "Tático", "Narrativo"], store: "steam", color: "#b02a3a", tagline: "Um RPG de mesa que respeita suas escolhas.", storeLink: "https://store.steampowered.com/app/1086940/" },
  { slug: "cyberpunk-2077", name: "Cyberpunk 2077", appid: 1091500, genre: "RPG", genres: ["RPG", "Ação", "Mundo aberto"], store: "steam", color: "#d8d41a", tagline: "Vire uma lenda em Night City.", storeLink: "https://store.steampowered.com/app/1091500/", description: "Em Night City, você é V, um mercenário em busca de um chip de imortalidade. O update 2.0 e o expansion Phantom Liberty transformaram o jogo em uma aventura de mundo aberto da qual ninguém escapa impune." },
  { slug: "the-witcher-3-wild-hunt", name: "The Witcher 3: Wild Hunt", appid: 292030, genre: "RPG", genres: ["RPG", "Ação", "Mundo aberto"], store: "steam", color: "#d8b01a", tagline: "A Caçada Selvagem chegou.", storeLink: "https://store.steampowered.com/app/292030/", description: "Geralt de Rívia persegue Ciri em um mundo aberto de dimensões épicas. Missões secundárias dignas de protagonistas, escolhas consequentes e atmosfera inesquecível, agora com o modo next-gen gratuito." },
  { slug: "grand-theft-auto-v", name: "Grand Theft Auto V", appid: 271590, genre: "Ação", genres: ["Ação", "Mundo aberto", "Multijogador"], store: "steam", color: "#3f7fce", tagline: "Três criminosos, um plano ousado.", storeLink: "https://store.steampowered.com/app/271590/", description: "Michael, Franklin e Trevor desafiam as autoridades de Los Santos em uma história aberta de assaltos e excessos. O GTA Online segue vivo, com atualizações constantes e milhões de jogadores." },
  { slug: "red-dead-redemption-2", name: "Red Dead Redemption 2", appid: 1174180, genre: "Ação", genres: ["Ação", "Mundo aberto", "Aventura"], store: "steam", color: "#9a3f2a", tagline: "O fim do Velho Oeste.", storeLink: "https://store.steampowered.com/app/1174180/", description: "Arthur Morgan e a gangue Van der Linde fogem das leis em uma América em extinção. Uma das experiências de mundo aberto mais detalhadas já feitas, com multiplayer Red Dead Online." },
  { slug: "fortnite", name: "Fortnite", appid: null, genre: "Battle Royale", genres: ["Battle Royale", "Multijogador"], store: "epic", color: "#4f6fd8", tagline: "Construa, lute e vença.", storeLink: "https://store.epicgames.com/pt-BR/p/fortnite", description: "Fora do alcance da Steam, Fortnite é o battle royale que mistura construção e combate. Eventos ao vivo e crossovers culturais fazem dele um dos maiores fenômenos do mundo." },
  { slug: "fall-guys", name: "Fall Guys", appid: null, genre: "Party", genres: ["Party", "Casual", "Multijogador"], store: "epic", color: "#e8563a", tagline: "A corrida dos estranhos.", storeLink: "https://store.epicgames.com/pt-BR/p/fall-guys", description: "A maratona caótica em que corredores gelatinosos atravessam obstáculos insanos. Pode ser terminada por pegar a coroa... ou por um golpe de canhão." },
  { slug: "genshin-impact", name: "Genshin Impact", appid: null, genre: "RPG", genres: ["RPG", "Ação", "Mundo aberto"], store: "epic", color: "#3fbd9e", tagline: "Explore Teyvat e seus sete elementos.", storeLink: "https://store.epicgames.com/pt-BR/p/genshin-impact", description: "Um RPG de mundo aberto com visuais de anime e combate elemental em tempo real. Troque entre personagens, colecione relíquias e descubra os mistérios de Teyvat." },
];

export const bySlug = new Map(GAMES.map((g) => [g.slug, g]));
export const byAppid = new Map(GAMES.filter((g) => g.appid).map((g) => [String(g.appid), g]));

// Descrições padrão, usadas quando o jogo não tem descrição curada.
export function descriptionFor(g) {
  return (
    g.description ||
    `${g.name} é um dos jogos mais populares do momento. Consulte a página da loja para detalhes completos da experiência.`
  );
}
