import { tournamentConfig } from "../config/tournamentConfig";

function formatIso(value) {
  if (!value) return "n/a";
  return new Date(value).toLocaleString("en-US", { timeZone: tournamentConfig.timezone });
}

export function DebugPanel({ leaderboard, golfers, entries, scoreMeta, entryMeta, lastEntryFetchAt, lastSuccessfulScoreFetchAt }) {
  const teamsWithIssues = leaderboard.filter((entry) => entry.reviewNeeded);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-orange-300/25 bg-orange-950/30 p-4 text-sm text-orange-50">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-condensed text-2xl font-black uppercase text-white">Debug</h2>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-orange-100">Only visible with ?debug=1</span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div>Event: {scoreMeta?.eventName || tournamentConfig.displayName}</div>
          <div>Golfers loaded: {golfers.length}</div>
          <div>Entries loaded: {entries.length}</div>
          <div>ESPN event id: {scoreMeta?.selectedEventId || "n/a"}</div>
          <div>Score fetch: {formatIso(lastSuccessfulScoreFetchAt)}</div>
          <div>Entry fetch: {formatIso(lastEntryFetchAt || entryMeta?.fetchedAt)}</div>
          <div>Entry source: {entryMeta?.source || "n/a"}</div>
          <div>Score source: {scoreMeta?.source || "n/a"}</div>
        </div>

        <div className="mt-4">
          <h3 className="mb-2 font-condensed text-lg font-bold uppercase text-white">Review Needed</h3>
          {teamsWithIssues.length ? (
            <div className="grid gap-2">
              {teamsWithIssues.map((entry) => (
                <div key={entry.id} className="rounded-md border border-orange-300/20 bg-black/20 p-3">
                  <div className="font-bold text-white">{entry.name}</div>
                  <ul className="mt-1 list-disc pl-5 text-orange-100">
                    {entry.validationIssues.map((issue) => <li key={issue}>{issue}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-orange-100/70">No unmatched or duplicate team issues detected.</div>
          )}
        </div>
      </div>
    </section>
  );
}

