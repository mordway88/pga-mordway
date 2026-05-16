import { Medal, Ticket, Trophy } from "lucide-react";
import { tournamentConfig } from "../config/tournamentConfig";
import { getScoreTone } from "../lib/scoreTone";

const ICONS = [Trophy, Medal, Medal, Ticket];

function getPrizeGroups(leaderboard) {
  const prizes = tournamentConfig.prizes || [];
  const groups = [];
  let index = 0;

  while (index < leaderboard.length && groups.length < prizes.length) {
    const entry = leaderboard[index];
    const entries = leaderboard.filter((team) => team.totalScore === entry.totalScore);
    const firstPrizeIndex = Math.max(0, entry.rank - 1);
    if (firstPrizeIndex >= prizes.length) break;

    const coveredPrizes = prizes.slice(firstPrizeIndex, firstPrizeIndex + entries.length);
    const primaryPrize = prizes[firstPrizeIndex];
    groups.push({
      prize: primaryPrize,
      coveredPrizes,
      entries,
      tied: entries.length > 1,
      rankLabel: entries.length > 1 ? `T${entry.rank}` : primaryPrize.placeLabel,
    });
    index += entries.length;
  }

  return groups;
}

function getPrizeSummary(coveredPrizes, tied) {
  if (!coveredPrizes?.length) return "";
  if (tied) return `${coveredPrizes.map((prize) => prize.placeLabel).join(" / ")} tie`;
  return coveredPrizes[0].label;
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
    <div className="mb-3 rounded-lg border border-amber-200/15 bg-white/[0.055] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,.05)] sm:p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200">Current Payouts</div>
        <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">{getLeadText(leaderboard)}</div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {projectedGroups.map(({ prize, coveredPrizes, entries, tied, rankLabel }, index) => {
          const Icon = ICONS[index] || Medal;
          const primaryEntry = entries[0];

          return (
            <div key={prize.placeLabel} className="rounded-md border border-white/10 bg-[#071812]/78 p-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/20 bg-amber-200/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-100">
                  <Icon size={13} />
                  {rankLabel}
                </div>
                <div className="text-right font-condensed text-base font-black uppercase text-amber-200">
                  {tied ? "Payout TBD" : prize.prize}
                </div>
              </div>
              {primaryEntry ? (
                <div className="mt-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-condensed text-lg font-black uppercase tracking-[0.03em] text-white">{primaryEntry.name}</div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/42">
                        {tied ? `${entries.length} teams tied · ${getPrizeSummary(coveredPrizes, tied)}` : `${prize.label} · ${prize.prize}`}
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
