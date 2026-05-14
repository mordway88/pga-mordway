import { useState } from "react";
import { AlertTriangle, Loader2, Search, Users, X } from "lucide-react";
import { TeamRow } from "./TeamRow";

export function PoolLeaderboard({ leaderboard, entryMeta, entriesLoading, entryError, scoringStarted }) {
  const [expandedTeamId, setExpandedTeamId] = useState(leaderboard[0]?.id || null);
  const [teamQuery, setTeamQuery] = useState("");
  const normalizedQuery = teamQuery.trim().toLowerCase();
  const filteredLeaderboard = normalizedQuery
    ? leaderboard.filter((entry) => entry.name.toLowerCase().includes(normalizedQuery))
    : leaderboard;

  return (
    <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-3 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/62">
        <div className="inline-flex items-center gap-2 rounded-md border border-amber-200/15 bg-white/[0.07] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,.06)]">
          <Users size={14} className="text-amber-200" />
          {leaderboard.length} teams
        </div>
        {entryMeta?.lockedOutRows > 0 && (
          <div className="inline-flex items-center rounded-md border border-orange-300/20 bg-orange-300/10 px-3 py-2 text-orange-100">
            {entryMeta.lockedOutRows} late entries not counted
          </div>
        )}
        <div className="flex flex-col gap-2">
          {entriesLoading && !leaderboard.length && (
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white/70">
              <Loader2 size={16} className="animate-spin" />
              Loading teams
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

      <div className="mb-3 rounded-lg border border-white/10 bg-white/[0.055] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,.05)] sm:p-3">
        <label htmlFor="team-search" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">
          Find a team
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              id="team-search"
              value={teamQuery}
              onChange={(event) => setTeamQuery(event.target.value)}
              placeholder="Search by name"
              aria-label="Search teams by name"
              className="min-h-12 w-full rounded-lg border border-white/10 bg-[#081a15] py-2 pl-10 pr-3 text-base text-white outline-none placeholder:text-white/40 focus:border-amber-300/60"
            />
          </div>
          {teamQuery && (
            <button
              type="button"
              onClick={() => setTeamQuery("")}
              className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-white/10 px-3 font-condensed text-sm font-bold uppercase tracking-[0.12em] text-white/75 hover:bg-white/15 sm:px-4"
            >
              <X size={16} />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        {filteredLeaderboard.map((entry) => (
          <TeamRow
            key={entry.id}
            entry={entry}
            scoringStarted={scoringStarted}
            expanded={expandedTeamId === entry.id}
            onToggle={() => setExpandedTeamId(expandedTeamId === entry.id ? null : entry.id)}
          />
        ))}
      </div>

      {leaderboard.length > 0 && !filteredLeaderboard.length && (
        <div className="rounded-xl border border-white/10 bg-white/[0.05] p-6 text-center text-white/70">
          <div>No teams match "{teamQuery.trim()}".</div>
          <button
            type="button"
            onClick={() => setTeamQuery("")}
            className="mt-3 rounded-lg bg-amber-300 px-4 py-2 font-condensed text-sm font-bold uppercase tracking-[0.12em] text-emerald-950"
          >
            Clear search
          </button>
        </div>
      )}

      {!leaderboard.length && !entriesLoading && (
        <div className="rounded-xl border border-white/10 bg-white/[0.05] p-6 text-center text-white/60">
          No pool teams loaded. Check the entry sheet connection or refresh the page.
        </div>
      )}
    </section>
  );
}
