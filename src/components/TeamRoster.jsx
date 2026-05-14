import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { PlayerCard } from "./PlayerCard";
import { GolferScorecard } from "./GolferScorecard";

export function TeamRoster({ entry, scoringStarted }) {
  const [expandedGolfer, setExpandedGolfer] = useState(null);

  return (
    <div className="border-t border-amber-200/10 bg-[#06110e] p-2.5 sm:p-4">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="font-condensed text-lg font-bold uppercase text-white sm:text-xl">{scoringStarted ? "Team Score" : "Team Roster"}</div>
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
          {scoringStarted ? "Best 10 counting, worst 4 dropped" : "Listed by group until scores start"}
        </div>
      </div>
      <div className="grid gap-2">
        {entry.playersData.map((golfer) => {
          const key = `${entry.id}-${golfer.normalizedName}-${golfer.name}`;
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
        })}
      </div>
    </div>
  );
}
