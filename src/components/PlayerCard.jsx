import { ChevronDown, ChevronUp, CircleAlert } from "lucide-react";
import { getScoreTone } from "../lib/scoreTone";

const OUT_STATUS_LABELS = {
  CUT: "Cut — no longer playing",
  WD: "WD — withdrew",
  DQ: "DQ — disqualified",
};

const STATUS_BADGE_CLASSES = {
  CUT: "border-rose-300/60 bg-rose-500/15 text-rose-100",
  WD: "border-amber-300/60 bg-amber-400/15 text-amber-100",
  DQ: "border-orange-300/60 bg-orange-500/15 text-orange-100",
};

export function PlayerCard({ golfer, expanded, onToggle, scoringStarted }) {
  const outStatus = OUT_STATUS_LABELS[golfer.status] ? golfer.status : null;
  const problemStatus = golfer.isMissing || outStatus;
  const roleLabel = scoringStarted ? (golfer.isCounting ? "Counting" : "Dropped") : `Group ${golfer.groupNumber}`;
  const statusLabel = golfer.isMissing
    ? scoringStarted
      ? "Not matched to live scoring — team total may be incomplete."
      : "Not matched to live scoring"
    : scoringStarted
      ? OUT_STATUS_LABELS[golfer.status] || golfer.status || "Not started"
      : `Round ${golfer.scheduledRound || 1} tee time`;

  return (
    <div className={`rounded-md border transition ${golfer.isCounting ? "border-amber-300/50 bg-emerald-950/70 shadow-[inset_3px_0_0_rgba(252,211,77,.85)]" : "border-slate-300/10 bg-[#0a1714]"} ${scoringStarted && !golfer.isCounting ? "opacity-[.85]" : ""} ${problemStatus ? "border-orange-300/60" : ""}`}>
      <button type="button" onClick={onToggle} className="grid w-full grid-cols-1 items-center gap-1.5 p-3 text-left sm:grid-cols-[1fr_auto]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-condensed text-base font-bold uppercase tracking-[0.04em] text-white sm:text-lg">{golfer.name}</span>
            {outStatus && (
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] ${STATUS_BADGE_CLASSES[outStatus]}`}>
                {outStatus}
              </span>
            )}
            {golfer.isMissing && (
              <span className="rounded-full border border-orange-300/60 bg-orange-400/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-orange-100">
                Review
              </span>
            )}
            {problemStatus && <CircleAlert size={16} className="text-orange-200" />}
          </div>
          <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white/55">
            <span>{roleLabel}</span>
            <span>{statusLabel}</span>
            {scoringStarted && <span>Today {golfer.todayScore}</span>}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className={`whitespace-nowrap font-condensed text-xl font-black sm:text-2xl ${getScoreTone(golfer.score, golfer.isMissing)}`}>
            {scoringStarted ? golfer.displayScore : golfer.teeTime}
          </span>
          {expanded ? <ChevronUp size={20} className="text-white/60" /> : <ChevronDown size={20} className="text-white/60" />}
        </div>
      </button>
    </div>
  );
}
