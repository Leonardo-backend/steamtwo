// Funções puras de ranking — fáceis de testar. Usadas pelo construtor de
// painel real e pelos testes de domínio.

// 100 × (N − posição + 1) / N
export function normalizePosition(position, leagueSize) {
  if (position == null || !leagueSize) return 0;
  const v = Math.round((100 * (leagueSize - position + 1)) / leagueSize);
  return Math.max(0, Math.min(100, v));
}

// Média de um conjunto de posições (snapshots válidos). Retorna null se vazio.
export function weeklyAverage(ranks) {
  const vals = (ranks || []).filter((r) => r != null);
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

// Índice do "de sempre": pico de jogadores normalizado pelo maior pico.
export function peakIndex(peak, maxPeak) {
  if (peak == null || !maxPeak) return 0;
  return Math.max(0, Math.min(100, Math.round((100 * peak) / maxPeak)));
}

export function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(v)));
}

// Cores determinísticas a partir do slug (usada para jogos sem capa curada).
export function colorForSlug(slug) {
  let h = 0;
  const s = String(slug);
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return `hsl(${h}, 45%, 42%)`;
}
