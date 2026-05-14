import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getScoreTone } from "../lib/scoreTone";
import { TeamRoster } from "./TeamRoster";

function formatUnmatchedMessage(count) {
  if (!count) return null;
  return count === 1 ? "1 golfer not matched to live scoring" : `${count} golfers not matched to live scoring`;
}

export function TeamRow({ entry, expanded, onToggle, scoringStarted }) {
  const hasTeamActivity = entry.onCourseCount > 0 || entry.finishedCount > 0 || entry.outCount > 0;
  const activityText = [
    entry.onCourseCount > 0 ? `${entry.onCourseCount} on course` : null,
    entry.finishedCount > 0 ? `${entry.finishedCount} finished` : null,
    entry.outCount > 0 ? `${entry.outCount} cut/WD/DQ` : null,
  ].filter(Boolean).join(" · ");
  const detailText = scoringStarted && hasTeamActivity
    ? activityText
    : `Earliest team tee time: ${entry.nextTeeTime}`;
  const unmatchedMessage = formatUnmatchedMessage(entry.unmatchedPlayers.length);

  return (
    <motion.div
      layout
      className={`group overflow-hidden rounded-lg border shadow-xl transition duration-200 ${
        expanded
          ? "border-amber-300/45 bg-[linear-gradient(135deg,rgba(252,211,77,.12),rgba(16,55,43,.96))] shadow-[0_18px_55px_rgba(0,0,0,.32),0_0_0_1px_rgba(252,211,77,.08)]"
          : "border-amber-100/12 bg-[linear-gradient(135deg,rgba(252,211,77,.055),rgba(18,43,34,.95))] hover:border-amber-200/22 hover:shadow-[0_14px_38px_rgba(0,0,0,.28)]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className={`grid w-full items-center gap-3 p-3 text-left sm:p-4 ${
          scoringStarted ? "grid-cols-[auto_1fr_auto_auto]" : "grid-cols-[1fr_auto]"
        }`}
      >
        {scoringStarted && (
          <div className="grid h-10 w-10 place-items-center rounded-md bg-amber-300 font-condensed text-xl font-black text-emerald-950">
            {entry.rank}
          </div>
        )}
        <div>
          <div className="flex flex-wrap items-center gap-2 font-condensed text-xl font-bold uppercase tracking-[0.04em] text-white sm:text-2xl">
            {entry.name}
            {entry.reviewNeeded && (
              <span className="rounded-full border border-orange-300/50 bg-orange-300/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-orange-100">
                Review needed
              </span>
            )}
          </div>
          <div className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/48">
            {scoringStarted && unmatchedMessage ? unmatchedMessage : detailText}
          </div>
        </div>
        {scoringStarted && (
          <div className={`text-right font-condensed text-2xl font-black sm:text-4xl ${getScoreTone(entry.totalScore)}`}>
            {entry.displayTotal}
          </div>
        )}
        <div className="flex items-center justify-end gap-2">
          <span className={`font-condensed text-xs font-bold uppercase tracking-[0.12em] ${expanded ? "text-amber-200" : "text-white/50 group-hover:text-white/75"}`}>
            {expanded ? "Hide" : "View team"}
          </span>
          {expanded ? <ChevronUp size={22} className="text-amber-200" /> : <ChevronDown size={22} className="text-white/45 transition group-hover:text-white/75" />}
        </div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <TeamRoster entry={entry} scoringStarted={scoringStarted} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
