import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getScoreTone } from "../lib/scoreTone";
import { TeamRoster } from "./TeamRoster";

function getPrizeStatus(entry) {
  return entry?.projectedPayout?.shortLabel || null;
}

function formatStatusCounts(statusCounts = {}) {
  return [
    statusCounts.CUT > 0 ? `${statusCounts.CUT} cut` : null,
    statusCounts.WD > 0 ? `${statusCounts.WD} WD` : null,
    statusCounts.DQ > 0 ? `${statusCounts.DQ} DQ` : null,
  ].filter(Boolean).join(" · ");
}

export function TeamRow({ entry, expanded, onToggle, scoringStarted }) {
  const hasTeamActivity = entry.onCourseCount > 0 || entry.finishedCount > 0 || entry.outCount > 0;
  const statusSummary = formatStatusCounts(entry.statusCounts);
  const activityText = [
    entry.onCourseCount > 0 ? `${entry.onCourseCount} on course` : null,
    entry.finishedCount > 0 ? `${entry.finishedCount} finished` : null,
    statusSummary || null,
  ].filter(Boolean).join(" · ");
  const detailText = scoringStarted && hasTeamActivity
    ? activityText
    : `Earliest team tee time: ${entry.nextTeeTime}`;
  const prizeStatus = scoringStarted ? getPrizeStatus(entry) : null;

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
        aria-expanded={expanded}
        className={`grid w-full items-center gap-3 p-3 text-left sm:p-4 ${
          scoringStarted ? "grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_auto]" : "grid-cols-[1fr_auto]"
        }`}
      >
        {scoringStarted && (
          <div className="grid h-10 min-w-10 place-items-center rounded-md bg-amber-300 px-2 font-condensed text-xl font-black text-emerald-950">
            {entry.rankLabel || entry.rank}
          </div>
        )}
        <div>
          <div className="flex flex-wrap items-center gap-2 font-condensed text-xl font-bold uppercase tracking-[0.04em] text-white sm:text-2xl">
            {entry.name}
            {prizeStatus && (
              <span className="rounded-full border border-amber-200/35 bg-amber-300/14 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-100">
                {prizeStatus}
              </span>
            )}
          </div>
          <div className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/48">
            {detailText}
          </div>
        </div>
        {scoringStarted && (
          <div className={`text-right font-condensed text-3xl font-black sm:text-4xl ${getScoreTone(entry.totalScore)}`}>
            {entry.displayTotal}
          </div>
        )}
        <div className="col-span-full flex items-center justify-between gap-2 border-t border-white/8 pt-2 sm:col-span-1 sm:border-0 sm:pt-0">
          <div className="flex flex-wrap gap-1 sm:hidden">
            <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/55">{entry.playersData.filter((player) => player.isCounting).length}/10 counting</span>
            {statusSummary && <span className="rounded-full bg-orange-300/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-orange-100">{statusSummary}</span>}
          </div>
          <span className={`font-condensed text-xs font-bold uppercase tracking-[0.12em] ${expanded ? "text-amber-200" : "text-white/50 group-hover:text-white/75"}`}>
            {expanded ? "Collapse team" : "View team"}
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
