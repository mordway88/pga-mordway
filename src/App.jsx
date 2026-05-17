import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Loader2, RadioTower, RefreshCw } from "lucide-react";
import { NavTabs } from "./components/NavTabs";
import { PoolLeaderboard } from "./components/PoolLeaderboard";
import { TournamentLeaderboard } from "./components/TournamentLeaderboard";
import { WanamakerTrophy } from "./components/WanamakerTrophy";
import { DebugPanel } from "./components/DebugPanel";
import { tournamentConfig } from "./config/tournamentConfig";
import { calculateLeaderboard } from "./lib/calculateLeaderboard";
import { fetchEspnGolfData } from "./lib/fetchEspnGolfData";
import { fetchPoolEntries } from "./lib/fetchPoolEntries";
import { generateMockGolfers } from "./lib/generateMockGolfers";
import { hasTournamentStarted } from "./lib/teeTimes";

const ENABLE_MOCK_SCORING = import.meta.env.VITE_ENABLE_MOCK_SCORING === "true";
const SCORE_DELAY_WARNING_MS = 5 * 60 * 1000;
const SCORE_STORAGE_KEY = `${tournamentConfig.id}:lastGoodScores`;
const ENTRY_STORAGE_KEY = `${tournamentConfig.id}:lastGoodEntries`;
const BUILD_LABEL = import.meta.env.VITE_APP_VERSION || new Date().toISOString().slice(0, 10);

function formatLastUpdated(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: tournamentConfig.timezone,
    timeZoneName: "short",
  }).format(date);
}

function readStoredPayload(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredPayload(key, payload) {
  try {
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Storage is a convenience fallback only; never block live scoring on it.
  }
}

export default function App() {
  const storedScores = typeof window !== "undefined" ? readStoredPayload(SCORE_STORAGE_KEY) : null;
  const storedEntries = typeof window !== "undefined" ? readStoredPayload(ENTRY_STORAGE_KEY) : null;
  const [activeView, setActiveView] = useState("pool");
  const [golfers, setGolfers] = useState(storedScores?.golfers || []);
  const [entries, setEntries] = useState(storedEntries?.entries || []);
  const [entryMeta, setEntryMeta] = useState(storedEntries || null);
  const [scoreMeta, setScoreMeta] = useState(storedScores || null);
  const [scoresLoading, setScoresLoading] = useState(!storedScores?.golfers?.length);
  const [entriesLoading, setEntriesLoading] = useState(!storedEntries?.entries?.length);
  const [scoreError, setScoreError] = useState(null);
  const [entryError, setEntryError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(storedScores?.fetchedAt ? formatLastUpdated(new Date(storedScores.fetchedAt)) : "");
  const [lastSuccessfulScoreFetchAt, setLastSuccessfulScoreFetchAt] = useState(storedScores?.fetchedAt || null);
  const [lastEntryFetchAt, setLastEntryFetchAt] = useState(storedEntries?.fetchedAt || null);
  const [currentTimeMs, setCurrentTimeMs] = useState(() => new Date().getTime());
  const [testDataMode, setTestDataMode] = useState(false);
  const [nextScoreRefreshAt, setNextScoreRefreshAt] = useState(() => new Date().getTime() + tournamentConfig.scoreRefreshMs);
  const debugMode = new URLSearchParams(window.location.search).get("debug") === "1";
  const lastSuccessfulScoreFetchAtRef = useRef(storedScores?.fetchedAt || null);
  const entriesCountRef = useRef(storedEntries?.entries?.length || 0);

  const loadGolfData = useCallback(async ({ silent = false } = {}) => {
    await Promise.resolve();
    if (!silent) setScoresLoading(true);
    setScoreError(null);

    try {
      const result = await fetchEspnGolfData();
      setGolfers(result.golfers);
      setScoreMeta(result);
      setTestDataMode(false);
      setLastSuccessfulScoreFetchAt(result.fetchedAt);
      lastSuccessfulScoreFetchAtRef.current = result.fetchedAt;
      setLastUpdated(formatLastUpdated(new Date(result.fetchedAt)));
      setNextScoreRefreshAt(new Date().getTime() + tournamentConfig.scoreRefreshMs);
      writeStoredPayload(SCORE_STORAGE_KEY, result);
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
        setScoreMeta({ eventName: tournamentConfig.displayName, source: "Simulation", fetchedAt, golfers: generateMockGolfers() });
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
      entriesCountRef.current = result.entries?.length || 0;
      setEntryMeta(result);
      setLastEntryFetchAt(result.fetchedAt);
      writeStoredPayload(ENTRY_STORAGE_KEY, result);
      setEntryError(null);
    } catch (fetchError) {
      console.error(fetchError);
      if (!entriesCountRef.current) {
        setEntryError("Could not load pool entries. Retrying automatically.");
      }
    } finally {
      setEntriesLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoadId = window.setTimeout(() => {
      loadGolfData();
      loadEntries();
    }, 0);
    const scoreIntervalId = window.setInterval(() => loadGolfData({ silent: true }), tournamentConfig.scoreRefreshMs);
    const entryIntervalId = window.setInterval(() => loadEntries({ silent: true }), 60000);
    const clockIntervalId = window.setInterval(() => setCurrentTimeMs(new Date().getTime()), 1000);

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
  const tournamentFinished = useMemo(() => {
    return Boolean(
      scoringStarted &&
        golfers.length &&
        golfers.some((golfer) => golfer.currentRoundNum >= 4 || golfer.roundScores?.[3] !== "-") &&
        golfers.every((golfer) => golfer.status === "F" || golfer.isOut),
    );
  }, [golfers, scoringStarted]);
  const delayedScores = Boolean(
    scoringStarted &&
      lastSuccessfulScoreFetchAt &&
      currentTimeMs &&
      currentTimeMs - new Date(lastSuccessfulScoreFetchAt).getTime() > SCORE_DELAY_WARNING_MS
  );
  const showScoreWarning = Boolean(scoreError && (!lastSuccessfulScoreFetchAt || delayedScores || testDataMode));
  const headerStatus = testDataMode ? "TEST DATA" : scoreError && !lastSuccessfulScoreFetchAt ? "ERROR" : delayedScores ? "UPDATE DELAYED" : tournamentFinished ? "FINAL" : scoringStarted ? "LIVE" : "TEE TIMES";
  const nextRefreshSeconds = Math.max(0, Math.ceil((nextScoreRefreshAt - currentTimeMs) / 1000));
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
      <header className="sticky top-0 z-40 overflow-hidden border-b border-amber-200/10 bg-[#04110d]/94 shadow-[0_18px_60px_rgba(0,0,0,.45)] backdrop-blur-xl">
        <div className="broadcast-bar h-1" />
        <WanamakerTrophy />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-2 lg:flex-row lg:items-end">
            <div>
              <p className="font-serif text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200">{tournamentConfig.productLabel}</p>
              <h1 className="mt-0.5 font-condensed text-3xl font-black uppercase leading-none text-white drop-shadow-[0_2px_18px_rgba(255,255,255,.08)] sm:text-5xl">
                {tournamentConfig.appTitle}
              </h1>
              <div className="mt-1 font-condensed text-lg font-bold uppercase tracking-[0.16em] text-white/62 sm:text-xl">
                Fantasy Leaderboard
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.055] p-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/60 lg:min-w-80">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className="text-amber-100">{tournamentConfig.displayName}</span>
                <span className={headerStatus === "LIVE" ? "text-emerald-200" : headerStatus === "UPDATE DELAYED" ? "text-amber-200" : "text-white/60"}>{headerStatus}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-2">
                {scoresLoading && !lastUpdated && <Loader2 size={14} className="animate-spin text-amber-200" />}
                  {lastUpdated ? `Updated ${lastUpdated}` : "Loading scores"}
                </span>
                <span>{entries.length} teams</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-2">
                  <RadioTower size={14} />
                  Scores refresh automatically
                </span>
                <button
                  type="button"
                  onClick={() => loadGolfData()}
                  className="inline-flex items-center gap-1 rounded-md border border-amber-200/20 bg-amber-200/10 px-2 py-1 text-amber-100 transition hover:bg-amber-200/18"
                >
                  <RefreshCw size={13} className={scoresLoading ? "animate-spin" : ""} />
                  Refresh · {nextRefreshSeconds}s
                </button>
              </div>
            </div>
          </div>
          <NavTabs activeView={activeView} onChange={setActiveView} />
        </div>
      </header>

      {showScoreWarning && (
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
        {debugMode && (
          <DebugPanel
            leaderboard={leaderboard}
            golfers={golfers}
            entries={entries}
            scoreMeta={scoreMeta}
            entryMeta={entryMeta}
            lastEntryFetchAt={lastEntryFetchAt}
            lastSuccessfulScoreFetchAt={lastSuccessfulScoreFetchAt}
          />
        )}
      </motion.main>

      <footer className="border-t border-white/10 px-4 py-6 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
        {tournamentConfig.appTitle} · Build {BUILD_LABEL} · Updated {lastUpdated || "loading"} · {entries.length || entryMeta?.entries?.length || 0} teams
      </footer>
    </div>
  );
}
