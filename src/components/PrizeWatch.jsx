import { Medal, Ticket, Trophy } from "lucide-react";
import { tournamentConfig } from "../config/tournamentConfig";
import { getScoreTone } from "../lib/scoreTone";

const ICONS = [Trophy, Medal, Medal, Ticket];

function getPrizeGroups(leaderboard) {
  return (tournamentConfig.prizes || []).map((prize, index) => {
    const entry = leaderboard[index] || null;
    if (!entry) return { prize, entries: [], tied: false, rankLabel: prize.placeLabel };

    const entries = leaderboard.filter((team) => team.totalScore === entry.totalScore);
    return {
      prize,
      entries,
      tied: entries.length > 1,
      rankLabel: entries.length > 1 ? `T${entry.rank}` : prize.placeLabel,
    };
  });
}

function getLeadText(leaderboard) {
  const leader = leaderboard[0];
  if (!leader) return "Projected payouts appear once teams load.";
  const tiedLeaders = leaderboard.filter((entry) => entry.totalScore === leader.totalScore);
  if (tiedLeaders.length > 1) return `${tiedLeaders.length} teams are tied for 1st.`;

  const next = leaderboard.find((entry) => entry.totalScore !== leader.totalScore);
  if (!next) return `${leader.name} is alone at the top.`;

  const margin = next.totalScore - leader.totalScore;
  return `${leader.name} leads by ${margin} ${margin === 1 ? "shot" : "shots"}.`;
}

export function PrizeWatch({ leaderboard, scoringStarted }) {
  if (!scoringStarted || !leaderboard.length) return null;

  const projectedGroups = getPrizeGroups(leaderboard);

  return (
    <div className="mb-3 overflow-hidden rounded-lg border border-amber-200/20 bg-[linear-gradient(135deg,rgba(252,211,77,.16),rgba(6,35,27,.82)_42%,rgba(8,19,16,.96))] shadow-[0_18px_42px_rgba(0,0,0,.24),inset_0_1px_0_rgba(255,255,255,.08)]">
      <div className="flex flex-col gap-1 border-b border-amber-200/15 px-3 py-3 sm:flex-row sm:items-end sm:justify-between sm:px-4">
        <div>
          <p className="font-serif text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200">Prize Watch</p>
          <h2 className="font-condensed text-2xl font-black uppercase leading-none text-white">If It Ended Now</h2>
        </div>
        <div className="text-xs font-bold uppercase tracking-[0.12em] text-white/58">{getLeadText(leaderboard)}</div>
      </div>

      <div className="grid gap-px bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
        {projectedGroups.map(({ prize, entries, tied, rankLabel }, index) => {
          const Icon = ICONS[index] || Medal;
          const primaryEntry = entries[0];

          return (
            <div key={prize.placeLabel} className="bg-[#071812]/94 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-100">
                  <Icon size={13} />
                  {rankLabel}
                </div>
                <div className="text-right font-condensed text-lg font-black uppercase text-amber-200">
                  {tied ? "Tie unresolved" : prize.prize}
                </div>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                {tied ? "Projected tie" : prize.label}
              </div>
              {primaryEntry ? (
                <div className="mt-1">
                  <div className="flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-condensed text-xl font-black uppercase tracking-[0.03em] text-white">{primaryEntry.name}</div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                        {tied ? `${entries.length} teams tied` : `Projected ${prize.placeLabel} · ${prize.prize}`}
                      </div>
                    </div>
                    <div className={`shrink-0 font-condensed text-2xl font-black ${getScoreTone(primaryEntry.totalScore)}`}>{primaryEntry.displayTotal}</div>
                  </div>
                  {tied && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {entries.slice(1, 4).map((entry) => (
                        <span key={entry.id} className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">
                          {entry.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-2 text-sm font-semibold text-white/50">Waiting for team data</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

