export function parseGolfScore(scoreValue) {
  const scoreStr = String(scoreValue ?? "E").trim();
  const upper = scoreStr.toUpperCase();

  if (scoreStr === "" || upper === "E" || upper === "EVEN") return 0;
  if (["CUT", "WD", "DQ", "--", "-"].includes(upper)) return null;

  const parsed = parseInt(scoreStr.replace("+", ""), 10);
  return Number.isNaN(parsed) ? null : parsed;
}
