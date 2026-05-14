export function getHoleScoreClass(score, par) {
  if (!score || !par) return "border-white/10 bg-white/5 text-white/55";

  const diff = score - par;

  if (diff <= -2) return "border-amber-300 bg-amber-200 text-amber-950 font-bold";
  if (diff === -1) return "border-emerald-300 bg-emerald-100 text-emerald-900 font-bold";
  if (diff === 0) return "border-white/15 bg-white text-slate-700";
  if (diff === 1) return "border-red-300 bg-red-100 text-red-800 font-bold";
  if (diff >= 2) return "border-sky-300 bg-sky-100 text-sky-800 font-bold";

  return "border-white/15 bg-white text-slate-700";
}
