import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { getScoreTone } from "../lib/scoreTone";
import { TeamRoster } from "./TeamRoster";

export function TeamRow({ entry, expanded, onToggle, scoringStarted }) {
  const detailText = scoringStarted
    ? `${entry.onCourseCount} on course · ${entry.finishedCount} finished${entry.outCount ? ` · ${entry.outCount} cut/WD/DQ` : ""}`
    : `First tee time ${entry.nextTeeTime}`;

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
          <div className="flex items-center gap-2 font-condensed text-xl font-bold uppercase tracking-[0.04em] text-white sm:text-2xl">
            {scoringStarted && entry.rank <= 3 && <Sparkles size={15} className="text-amber-200" />}
            {entry.name}
          </div>
          <div className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/48">
            {entry.unmatchedPlayers.length ? `${entry.unmatchedPlayers.length} player not found in live scores` : detailText}
          </div>
        </div>
        {scoringStarted && (
          <div className={`text-right font-condensed text-2xl font-black sm:text-4xl ${getScoreTone(entry.totalScore)}`}>
            {entry.displayTotal}
          </div>
        )}
        {expanded ? <ChevronUp size={22} className="text-amber-200" /> : <ChevronDown size={22} className="text-white/45 transition group-hover:text-white/75" />}
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
