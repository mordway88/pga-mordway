export function getScoreTone(score, isMissing = false) {
  if (isMissing) return "text-orange-200";
  if (score < 0) return "text-red-300";
  if (score > 0 && score < 999) return "text-sky-200";
  if (score >= 999) return "text-orange-200";
  return "text-emerald-100";
}
