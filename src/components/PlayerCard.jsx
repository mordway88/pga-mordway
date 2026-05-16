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

const PLAY_STATE_BADGES = {
  onCourse: {
    label: "On course now",
    className: "border-emerald-300/60 bg-emerald-300/15 text-emerald-100",
  },
  finishedToday: {
    label: "Finished today",
    className: "border-sky-300/50 bg-sky-300/12 text-sky-100",
  },
  notStartedToday: {
    label: "Not teed off today",
    className: "border-white/15 bg-white/[0.06] text-white/60",
  },
};

const ROLE_CLASSES = {
  Counting: "border-amber-300/45 bg-amber-300/12 text-amber-100",
  Dropped: "border-white/15 bg-white/[0.06] text-white/55",
};

function getRoundStatusLabel(golfer, scoringStarted) {
  if (!scoringStarted) return `Round ${golfer.scheduledRound || 1} tee time`;
  if (golfer.isMissing) return "Not matched to live scoring";
  if (OUT_STATUS_LABELS[golfer.status]) return OUT_STATUS_LABELS[golfer.status];
  if (golfer.playState === "onCourse") return golfer.status || "On course now";
  if (golfer.playState === "finishedToday") return `Finished Round ${golfer.currentRoundNum || golfer.scheduledRound || ""}`.trim();
  if (golfer.playState === "notStartedToday") return `Tee time ${golfer.teeTime || "TBA"}`;
  return golfer.status || "Not started";
}

export function PlayerCard({ golfer, expanded, onToggle, scoringStarted }) {
  const outStatus = OUT_STATUS_LABELS[golfer.status] ? golfer.status : null;
  const problemStatus = golfer.isMissing || golfer.isDuplicate || outStatus;
  const roleLabel = scoringStarted ? (golfer.isCounting ? "Counting" : "Dropped") : `Group ${golfer.groupNumber}`;
  const statusLabel = golfer.isMissing
    ? scoringStarted
      ? "Not matched to live scoring — team total may be incomplete."
      : "Not matched to live scoring"
    : getRoundStatusLabel(golfer, scoringStarted);
  const playBadge = scoringStarted && !problemStatus ? PLAY_STATE_BADGES[golfer.playState] : null;
  const showToday = scoringStarted && ["onCourse", "finishedToday"].includes(golfer.playState) && golfer.todayScore !== "-";

  return (
    <div className={`rounded-md border transition ${golfer.isCounting ? "border-amber-300/50 bg-emerald-950/70 shadow-[inset_3px_0_0_rgba(252,211,77,.85)]" : "border-slate-300/10 bg-[#0a1714]"} ${scoringStarted && !golfer.isCounting ? "opacity-[.88]" : ""} ${problemStatus ? "border-orange-300/60" : ""}`}>
      <button type="button" onClick={onToggle} aria-expanded={expanded} className="grid w-full grid-cols-1 items-center gap-2 p-3 text-left sm:grid-cols-[1fr_auto]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-condensed text-base font-bold uppercase tracking-[0.04em] text-white sm:text-lg">{golfer.name}</span>
            {scoringStarted && (
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] ${ROLE_CLASSES[roleLabel] || ROLE_CLASSES.Dropped}`}>
                {roleLabel}
              </span>
            )}
            {outStatus && (
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] ${STATUS_BADGE_CLASSES[outStatus]}`}>
                {outStatus}
              </span>
            )}
            {golfer.isMissing && (
              <span className="rounded-full border border-orange-300/60 bg-orange-400/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-orange-100">
                No score
              </span>
            )}
            {playBadge && (
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] ${playBadge.className}`}>
                {playBadge.label}
              </span>
            )}
            {problemStatus && <CircleAlert size={16} className="text-orange-200" />}
          </div>
          <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white/55">
            {!scoringStarted && <span>{roleLabel}</span>}
            <span>{statusLabel}</span>
            {showToday && <span>Today {golfer.todayScore}</span>}
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
