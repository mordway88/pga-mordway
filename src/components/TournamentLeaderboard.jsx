import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { getScoreTone } from "../lib/scoreTone";
import { normalizeName } from "../lib/normalizeName";
import { getEntryPlayers } from "../lib/calculateLeaderboard";
import { GolferScorecard } from "./GolferScorecard";

export function TournamentLeaderboard({ golfers, entries, scoringStarted }) {
  const [query, setQuery] = useState("");
  const [pickedOnly, setPickedOnly] = useState(false);
  const [expandedGolfer, setExpandedGolfer] = useState(null);
  const pickedNames = useMemo(() => new Set(entries.flatMap(getEntryPlayers).map(normalizeName)), [entries]);

  const filteredGolfers = useMemo(() => {
    return [...golfers]
      .sort((a, b) => a.score - b.score || a.name.localeCompare(b.name))
      .filter((golfer) => golfer.name.toLowerCase().includes(query.toLowerCase()))
      .filter((golfer) => !pickedOnly || pickedNames.has(golfer.normalizedName));
  }, [golfers, pickedNames, pickedOnly, query]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <p className="font-serif text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200">Live field</p>
          <h2 className="font-condensed text-4xl font-black uppercase leading-none text-white sm:text-5xl">Tournament Leaderboard</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative block">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search players"
              className="h-11 rounded-lg border border-white/10 bg-white/10 pl-10 pr-3 text-white outline-none placeholder:text-white/40 focus:border-amber-300/60"
            />
          </label>
          <button
            type="button"
            onClick={() => setPickedOnly((value) => !value)}
            className={`h-11 rounded-lg px-4 font-condensed text-sm font-bold uppercase tracking-[0.12em] ${
              pickedOnly ? "bg-amber-300 text-emerald-950" : "bg-white/10 text-white/75 hover:bg-white/15"
            }`}
          >
            Picked Golfers
          </button>
        </div>
      </div>

      <div className="scoreboard-panel overflow-hidden rounded-lg border border-white/10 shadow-xl">
        {filteredGolfers.map((golfer, index) => {
          const expanded = expandedGolfer === golfer.normalizedName;

          return (
            <motion.div key={golfer.normalizedName} layout className="border-b border-white/10 last:border-b-0">
              <button type="button" onClick={() => setExpandedGolfer(expanded ? null : golfer.normalizedName)} className="grid w-full grid-cols-[auto_1fr_auto_auto] items-center gap-3 p-3 text-left sm:p-4">
                <div className="w-9 text-center font-condensed text-xl font-bold text-white/50">{index + 1}</div>
                <div>
                  <div className="font-condensed text-xl font-bold uppercase tracking-[0.04em] text-white">{golfer.name}</div>
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                    {golfer.status}{scoringStarted ? ` · Today ${golfer.todayScore}` : ""}
                  </div>
                </div>
                <div className={`font-condensed text-3xl font-black ${getScoreTone(golfer.score)}`}>{golfer.displayScore}</div>
                {expanded ? <ChevronUp size={20} className="text-white/55" /> : <ChevronDown size={20} className="text-white/55" />}
              </button>
              <AnimatePresence>
                {expanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <GolferScorecard golfer={golfer} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
