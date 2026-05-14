import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { getScoreTone } from "../lib/scoreTone";
import { normalizeName } from "../lib/normalizeName";
import { getEntryPlayers } from "../lib/calculateLeaderboard";
import { GolferScorecard } from "./GolferScorecard";

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

function getTournamentRank(golfers, index) {
  const tiedWithPrevious = index > 0 && golfers[index - 1].score === golfers[index].score;
  const tiedWithNext = index < golfers.length - 1 && golfers[index + 1].score === golfers[index].score;
  if (!tiedWithPrevious && !tiedWithNext) return `${index + 1}`;

  let rank = index + 1;
  while (rank > 1 && golfers[rank - 2].score === golfers[index].score) {
    rank -= 1;
  }
  return `T${rank}`;
}

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
          <h2 className="font-condensed text-4xl font-black uppercase leading-none text-white sm:text-5xl">All Golfers</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative block">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search players"
              className="h-12 w-full rounded-lg border border-white/10 bg-white/10 pl-10 pr-10 text-white outline-none placeholder:text-white/40 focus:border-amber-300/60 sm:w-auto"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear player search" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/55 hover:text-white">
                <X size={16} />
              </button>
            )}
          </label>
          <button
            type="button"
            onClick={() => setPickedOnly((value) => !value)}
            className={`h-12 rounded-lg px-4 font-condensed text-sm font-bold uppercase tracking-[0.12em] ${
              pickedOnly ? "bg-amber-300 text-emerald-950" : "bg-white/10 text-white/75 hover:bg-white/15"
            }`}
          >
            {pickedOnly ? "Showing Pool Picks" : "Pool Picks Only"}
          </button>
        </div>
      </div>

      <div className="scoreboard-panel overflow-hidden rounded-lg border border-white/10 shadow-xl">
        {filteredGolfers.map((golfer, index) => {
          const expanded = expandedGolfer === golfer.normalizedName;
          const outStatus = OUT_STATUS_LABELS[golfer.status] ? golfer.status : null;

          return (
            <motion.div key={golfer.normalizedName} layout className="border-b border-white/10 last:border-b-0">
              <button type="button" onClick={() => setExpandedGolfer(expanded ? null : golfer.normalizedName)} className="grid w-full grid-cols-[auto_1fr_auto_auto] items-center gap-3 p-3 text-left sm:p-4">
                <div className="w-9 text-center font-condensed text-xl font-bold text-white/50">{getTournamentRank(filteredGolfers, index)}</div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 font-condensed text-xl font-bold uppercase tracking-[0.04em] text-white">
                    {golfer.name}
                    {outStatus && (
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] ${STATUS_BADGE_CLASSES[outStatus]}`}>
                        {outStatus}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                    {OUT_STATUS_LABELS[golfer.status] || golfer.status}{scoringStarted ? ` · Today ${golfer.todayScore}` : ""}
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
        {!filteredGolfers.length && (
          <div className="p-6 text-center text-white/65">
            <div>No golfers match "{query.trim()}".</div>
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-3 rounded-lg bg-amber-300 px-4 py-2 font-condensed text-sm font-bold uppercase tracking-[0.12em] text-emerald-950"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
