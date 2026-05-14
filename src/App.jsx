import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Loader2, RadioTower } from "lucide-react";
import { NavTabs } from "./components/NavTabs";
import { PoolLeaderboard } from "./components/PoolLeaderboard";
import { TournamentLeaderboard } from "./components/TournamentLeaderboard";
import { calculateLeaderboard } from "./lib/calculateLeaderboard";
import { fetchEspnGolfData } from "./lib/fetchEspnGolfData";
import { fetchPoolEntries } from "./lib/fetchPoolEntries";
import { generateMockGolfers } from "./lib/generateMockGolfers";
import { hasTournamentStarted } from "./lib/teeTimes";

const ENABLE_MOCK_SCORING = import.meta.env.VITE_ENABLE_MOCK_SCORING === "true";
const STALE_SCORE_MS = 2 * 60 * 1000;

function formatLastUpdated(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
    timeZoneName: "short",
  }).format(date);
}

export default function App() {
  const [activeView, setActiveView] = useState("pool");
  const [golfers, setGolfers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [entryMeta, setEntryMeta] = useState(null);
  const [scoresLoading, setScoresLoading] = useState(true);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [scoreError, setScoreError] = useState(null);
  const [entryError, setEntryError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [lastSuccessfulScoreFetchAt, setLastSuccessfulScoreFetchAt] = useState(null);
  const [currentTimeMs, setCurrentTimeMs] = useState(() => new Date().getTime());
  const [testDataMode, setTestDataMode] = useState(false);
  const lastSuccessfulScoreFetchAtRef = useRef(null);

  const loadGolfData = useCallback(async ({ silent = false } = {}) => {
    await Promise.resolve();
    if (!silent) setScoresLoading(true);
    setScoreError(null);

    try {
      const result = await fetchEspnGolfData();
      setGolfers(result.golfers);
      setTestDataMode(false);
      setLastSuccessfulScoreFetchAt(result.fetchedAt);
      lastSuccessfulScoreFetchAtRef.current = result.fetchedAt;
      setLastUpdated(formatLastUpdated(new Date(result.fetchedAt)));
    } catch (fetchError) {
      console.error(fetchError);

      if (ENABLE_MOCK_SCORING) {
        setGolfers(generateMockGolfers());
        setTestDataMode(true);
        setScoreError("TEST DATA — NOT LIVE SCORES");
        const fetchedAt = new Date().toISOString();
        setLastSuccessfulScoreFetchAt(fetchedAt);
        lastSuccessfulScoreFetchAtRef.current = fetchedAt;
        setLastUpdated(formatLastUpdated());
      } else {
        const lastGoodFetch = lastSuccessfulScoreFetchAtRef.current;
        setScoreError(
          lastGoodFetch
            ? `Live scores delayed. Showing last update from ${formatLastUpdated(new Date(lastGoodFetch))}. Retrying automatically.`
            : "Live scores are unavailable. Retrying automatically."
        );
      }
    } finally {
      setScoresLoading(false);
    }
  }, []);

  const loadEntries = useCallback(async ({ silent = false } = {}) => {
    await Promise.resolve();
    if (!silent) setEntriesLoading(true);
    setEntryError(null);

    try {
      const result = await fetchPoolEntries();
      setEntries(result.entries || []);
      setEntryMeta(result);
    } catch (fetchError) {
      console.error(fetchError);
      setEntryError("Could not load pool entries. Retrying automatically.");
    } finally {
      setEntriesLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoadId = window.setTimeout(() => {
      loadGolfData();
      loadEntries();
    }, 0);
    const scoreIntervalId = window.setInterval(() => loadGolfData({ silent: true }), 60000);
    const entryIntervalId = window.setInterval(() => loadEntries({ silent: true }), 60000);
    const clockIntervalId = window.setInterval(() => setCurrentTimeMs(new Date().getTime()), 30000);

    return () => {
      window.clearTimeout(initialLoadId);
      window.clearInterval(scoreIntervalId);
      window.clearInterval(entryIntervalId);
      window.clearInterval(clockIntervalId);
    };
  }, [loadEntries, loadGolfData]);

  const scoringStarted = useMemo(() => {
    return hasTournamentStarted() || golfers.some((golfer) => golfer.status === "F" || /^Thru/i.test(golfer.status || "") || golfer.todayScore !== "-");
  }, [golfers]);
  const staleScores = Boolean(
    scoringStarted &&
      lastSuccessfulScoreFetchAt &&
      currentTimeMs &&
      currentTimeMs - new Date(lastSuccessfulScoreFetchAt).getTime() > STALE_SCORE_MS
  );
  const headerStatus = testDataMode ? "TEST DATA" : scoreError && !lastSuccessfulScoreFetchAt ? "ERROR" : staleScores ? "STALE" : scoringStarted ? "LIVE" : "TEE TIMES";
  const headerStatusText = testDataMode
    ? "TEST DATA · Not live scores"
    : headerStatus === "ERROR"
      ? "ERROR · Retrying"
      : headerStatus === "STALE"
        ? `STALE · Last update ${lastUpdated || "unknown"}`
        : `${headerStatus} · Updated ${lastUpdated || "Loading"}`;
  const leaderboard = useMemo(() => calculateLeaderboard(entries, golfers, { scoringStarted }), [entries, golfers, scoringStarted]);

  const view = {
    pool: (
      <PoolLeaderboard
        leaderboard={leaderboard}
        entryMeta={entryMeta}
        entriesLoading={entriesLoading}
        entryError={entryError}
        scoringStarted={scoringStarted}
      />
    ),
    tournament: <TournamentLeaderboard golfers={golfers} entries={entries} scoringStarted={scoringStarted} />,
  }[activeView];

  return (
    <div className="min-h-screen bg-[#06130f] text-white">
      <header className="sticky top-0 z-40 border-b border-amber-200/10 bg-[#04110d]/94 shadow-[0_18px_60px_rgba(0,0,0,.45)] backdrop-blur-xl">
        <div className="broadcast-bar h-1" />
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-2 lg:flex-row lg:items-end">
            <div>
              <p className="font-serif text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200">PGA Championship</p>
              <h1 className="mt-1 font-condensed text-3xl font-black uppercase leading-none text-white drop-shadow-[0_2px_18px_rgba(255,255,255,.08)] sm:text-5xl">
                Fantasy Leaderboard
              </h1>
            </div>
            <div className="grid gap-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/55 lg:text-right">
              <span className="inline-flex items-center gap-2 lg:justify-end">
                {scoresLoading && !lastUpdated && <Loader2 size={14} className="animate-spin text-amber-200" />}
                {headerStatusText}
              </span>
              <span className="inline-flex items-center gap-2 lg:justify-end">
                <RadioTower size={14} />
                Scores refresh automatically
              </span>
            </div>
          </div>
          <NavTabs activeView={activeView} onChange={setActiveView} />
        </div>
      </header>

      {scoreError && (
        <div className={`border-b px-4 py-3 ${testDataMode ? "border-orange-300/25 bg-orange-400/10" : "border-amber-300/20 bg-amber-300/10"}`}>
          <div className={`mx-auto flex max-w-7xl items-center gap-2 text-sm font-semibold ${testDataMode ? "text-orange-100" : "text-amber-100"}`}>
            <AlertTriangle size={17} />
            {scoreError}
          </div>
        </div>
      )}

      <motion.main
        key={activeView}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        className="min-h-[70vh]"
      >
        {view}
      </motion.main>

      <footer className="border-t border-white/10 px-4 py-8 text-center text-xs font-bold uppercase tracking-[0.16em] text-white/35">
        PGA Championship Fantasy Leaderboard
      </footer>
    </div>
  );
}
