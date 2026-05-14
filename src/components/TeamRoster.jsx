import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { PlayerCard } from "./PlayerCard";
import { GolferScorecard } from "./GolferScorecard";

export function TeamRoster({ entry, scoringStarted }) {
  const [expandedGolfer, setExpandedGolfer] = useState(null);
  const countingPlayers = entry.playersData.filter((golfer) => golfer.isCounting);
  const droppedPlayers = entry.playersData.filter((golfer) => !golfer.isCounting);

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

      {entry.reviewNeeded && (
        <div className="mb-3 rounded-lg border border-orange-300/30 bg-orange-300/10 p-3 text-sm font-semibold text-orange-100">
          {entry.unmatchedPlayers.length === 1
            ? "1 golfer is not matched to live scoring. Team total may be incomplete."
            : `${entry.unmatchedPlayers.length} golfers are not matched to live scoring. Team total may be incomplete.`}
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
