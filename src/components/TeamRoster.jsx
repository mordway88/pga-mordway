import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { PlayerCard } from "./PlayerCard";
import { GolferScorecard } from "./GolferScorecard";

export function TeamRoster({ entry, scoringStarted }) {
  const [expandedGolfer, setExpandedGolfer] = useState(null);
  const countingPlayers = entry.playersData.filter((golfer) => golfer.isCounting);
  const droppedPlayers = entry.playersData.filter((golfer) => !golfer.isCounting);
  const notStartedCount = entry.playersData.filter((golfer) => golfer.playState === "notStartedToday").length;

  function renderGolfer(golfer) {
    const key = `${entry.id}-${golfer.groupNumber}-${golfer.normalizedName}-${golfer.name}`;
    const expanded = expandedGolfer === key;

    return (
      <motion.div key={key} layout>
        <PlayerCard golfer={golfer} expanded={expanded} scoringStarted={scoringStarted} onToggle={() => setExpandedGolfer(expanded ? null : key)} />
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <GolferScorecard golfer={golfer} compact={!scoringStarted && !golfer.hasStarted} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <div className="border-t border-amber-200/10 bg-[#06110e] p-2.5 sm:p-4">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="font-condensed text-lg font-bold uppercase text-white sm:text-xl">{scoringStarted ? "Golfers on This Team" : "Team Roster"}</div>
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
          {scoringStarted ? "Lowest 10 scores count. Highest 4 are dropped." : "Listed by group until live scoring starts."}
        </div>
      </div>

      {scoringStarted && (
        <div className="mb-3 grid gap-2 rounded-lg border border-white/10 bg-white/[0.045] p-3 text-xs font-bold uppercase tracking-[0.12em] text-white/58 sm:grid-cols-5">
          <div><span className="block text-white/35">Team total</span><span className="font-condensed text-xl text-white">{entry.displayTotal}</span></div>
          <div><span className="block text-white/35">Counting</span>{countingPlayers.length}/10</div>
          <div><span className="block text-white/35">On course</span>{entry.onCourseCount}</div>
          <div><span className="block text-white/35">Finished</span>{entry.finishedCount}</div>
          <div><span className="block text-white/35">Not started</span>{notStartedCount}</div>
        </div>
      )}

      {entry.reviewNeeded && (
        <div className="mb-3 rounded-lg border border-orange-300/30 bg-orange-300/10 p-3 text-sm font-semibold text-orange-100">
          <div className="font-bold uppercase tracking-[0.12em]">Review needed</div>
          <ul className="mt-1 list-disc pl-5">
            {entry.validationIssues.map((issue) => <li key={issue}>{issue}</li>)}
          </ul>
        </div>
      )}

      {!scoringStarted ? (
        <div className="grid gap-2">{entry.playersData.map(renderGolfer)}</div>
      ) : (
        <div className="grid gap-4">
          <section>
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <h3 className="font-condensed text-base font-bold uppercase text-amber-100">Counting — lowest 10 scores</h3>
              <span className="text-xs font-bold text-white/50">{countingPlayers.length}/10</span>
            </div>
            <div className="grid gap-2">{countingPlayers.map(renderGolfer)}</div>
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <h3 className="font-condensed text-base font-bold uppercase text-white/62">Dropped — highest 4 scores</h3>
              <span className="text-xs font-bold text-white/45">{droppedPlayers.length}/4</span>
            </div>
            <div className="grid gap-2">{droppedPlayers.map(renderGolfer)}</div>
          </section>
        </div>
      )}
    </div>
  );
}
