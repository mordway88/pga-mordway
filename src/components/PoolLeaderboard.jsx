import { useState } from "react";
import { AlertTriangle, Loader2, Users } from "lucide-react";
import { TeamRow } from "./TeamRow";

export function PoolLeaderboard({ leaderboard, offlineMode, entryMeta, entriesLoading, entryError, scoringStarted }) {
  const [expandedTeamId, setExpandedTeamId] = useState(leaderboard[0]?.id || null);

  return (
    <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-3 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/62">
        <div className="inline-flex items-center gap-2 rounded-md border border-amber-200/15 bg-white/[0.07] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,.06)]">
          <Users size={14} className="text-amber-200" />
          {leaderboard.length} teams
        </div>
        {entryMeta?.lockedOutRows > 0 && (
          <div className="inline-flex items-center rounded-md border border-orange-300/20 bg-orange-300/10 px-3 py-2 text-orange-100">
            {entryMeta.lockedOutRows} late rows ignored
          </div>
        )}
        <div className="flex flex-col gap-2">
          {entriesLoading && (
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white/70">
              <Loader2 size={16} className="animate-spin" />
              Loading sheet entries
            </div>
          )}
          {offlineMode && (
            <div className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-bold text-amber-100">
              Offline / mock scoring mode
            </div>
          )}
        </div>
      </div>

      {entryError && (
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-300/25 bg-red-500/10 p-3 text-sm font-semibold text-red-100">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          {entryError}
        </div>
      )}

      {!scoringStarted && (
        <div className="mb-3 rounded-lg border border-amber-300/25 bg-[linear-gradient(135deg,rgba(252,211,77,.13),rgba(16,185,129,.06))] p-3 text-sm font-semibold leading-5 text-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,.08)] sm:text-base sm:leading-6">
          Tap a team to view its golfers. Live rankings begin automatically when scores post.
        </div>
      )}

      <div className="grid gap-2">
        {leaderboard.map((entry) => (
          <TeamRow
            key={entry.id}
            entry={entry}
            scoringStarted={scoringStarted}
            expanded={expandedTeamId === entry.id}
            onToggle={() => setExpandedTeamId(expandedTeamId === entry.id ? null : entry.id)}
          />
        ))}
      </div>

      {!leaderboard.length && !entriesLoading && (
        <div className="rounded-xl border border-white/10 bg-white/[0.05] p-6 text-center text-white/60">
          No teams are loaded yet.
        </div>
      )}
    </section>
  );
}
