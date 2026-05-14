import { ChevronDown, ChevronUp, CircleAlert } from "lucide-react";
import { getScoreTone } from "../lib/scoreTone";

export function PlayerCard({ golfer, expanded, onToggle, scoringStarted }) {
  const problemStatus = golfer.isMissing || ["CUT", "WD", "DQ"].includes(golfer.status);
  const roleLabel = scoringStarted ? (golfer.isCounting ? "Counting" : "Dropped") : `Group ${golfer.groupNumber}`;
  const statusLabel = golfer.isMissing
    ? "Needs review"
    : scoringStarted
      ? golfer.status || "Not started"
      : `Round ${golfer.scheduledRound || 1} tee time`;

  return (
    <div className={`rounded-md border transition ${golfer.isCounting ? "border-amber-300/50 bg-emerald-950/70 shadow-[inset_3px_0_0_rgba(252,211,77,.85)]" : "border-slate-300/10 bg-[#0a1714]"} ${scoringStarted && !golfer.isCounting ? "opacity-75" : ""} ${problemStatus ? "border-orange-300/60" : ""}`}>
      <button type="button" onClick={onToggle} className="grid w-full grid-cols-1 items-center gap-1.5 p-3 text-left sm:grid-cols-[1fr_auto]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-condensed text-base font-bold uppercase tracking-[0.04em] text-white sm:text-lg">{golfer.name}</span>
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
