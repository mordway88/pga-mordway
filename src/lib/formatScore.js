export function formatScore(score) {
  if (score === null || score === undefined || Number.isNaN(score)) return "-";
  if (score === 0) return "E";
  return score > 0 ? `+${score}` : `${score}`;
}
