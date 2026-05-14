import { useMemo, useState } from "react";
import { COURSE_PARS, IN_PAR, OUT_PAR, TOTAL_PAR } from "../data/coursePars";
import { getHoleScoreClass } from "../lib/getHoleScoreClass";

function sum(values) {
  return values.reduce((total, value) => total + (Number(value) || 0), 0);
}

export function GolferScorecard({ golfer, selectedRound, onRoundChange, compact = false }) {
  const [localRound, setLocalRound] = useState(golfer.currentRoundNum || 1);
  const activeRound = selectedRound || localRound;
  const holes = golfer.holeByHole?.[activeRound] || Array(18).fill(null);
  const hasHoleData = holes.some(Boolean);
  const outTotal = useMemo(() => sum(holes.slice(0, 9)), [holes]);
  const inTotal = useMemo(() => sum(holes.slice(9)), [holes]);

  function changeRound(round) {
    setLocalRound(round);
    onRoundChange?.(round);
  }

  if (compact && !hasHoleData) {
    return (
      <div className="border-t border-white/10 bg-[#06130f] px-3 py-2.5 text-sm text-white/62">
        Scorecard appears after tee off. Round {activeRound} tee time:{" "}
        <span className="font-semibold text-white/82">{golfer.teeTime || "TBA"}</span>
      </div>
    );
  }

  return (
    <div className="border-t border-white/10 bg-[#05120f] p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-condensed text-lg font-bold uppercase text-white sm:text-xl">Scorecard</div>
          <div className="text-sm text-white/55">{golfer.status || golfer.teeTime || "TBA"}</div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((round) => (
            <button
              key={round}
              type="button"
              onClick={() => changeRound(round)}
              className={`rounded-md px-3 py-2 font-condensed text-sm font-bold uppercase ${
                activeRound === round ? "bg-amber-300 text-emerald-950" : "bg-white/10 text-white/70 hover:bg-white/15"
              }`}
            >
              R{round}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 grid grid-cols-4 gap-2">
        {golfer.roundScores.map((score, index) => (
          <div key={`round-${index + 1}`} className="border border-white/10 bg-white/[0.04] p-2 text-center sm:p-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">R{index + 1}</div>
            <div className="font-condensed text-xl font-bold text-white">{score}</div>
          </div>
        ))}
      </div>

      {!hasHoleData ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-white/65">
          Round {activeRound} scorecard will appear here when shot-by-shot data is available. Tee time: {golfer.teeTime || "TBA"}.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[920px] border-separate border-spacing-1 text-center text-sm">
            <tbody>
              <tr>
                <th className="sticky left-0 bg-[#05120f] px-2 py-2 text-left font-condensed uppercase tracking-[0.12em] text-white/55">Hole</th>
                {COURSE_PARS.map((_, index) => (
                  <th key={`hole-${index + 1}`} className="w-11 rounded bg-white/10 px-2 py-2 font-condensed text-white">
                    {index + 1}
                  </th>
                ))}
                <th className="rounded bg-white/10 px-3 py-2 font-condensed text-white">OUT</th>
                <th className="rounded bg-white/10 px-3 py-2 font-condensed text-white">IN</th>
                <th className="rounded bg-amber-300 px-3 py-2 font-condensed text-emerald-950">TOT</th>
              </tr>
              <tr>
                <th className="sticky left-0 bg-[#05120f] px-2 py-2 text-left font-condensed uppercase tracking-[0.12em] text-white/55">Par</th>
                {COURSE_PARS.map((par, index) => (
                  <td key={`par-${index + 1}`} className="rounded border border-white/10 bg-white/[0.04] px-2 py-2 text-white/70">
                    {par}
                  </td>
                ))}
                <td className="rounded border border-white/10 bg-white/[0.04] text-white/70">{OUT_PAR}</td>
                <td className="rounded border border-white/10 bg-white/[0.04] text-white/70">{IN_PAR}</td>
                <td className="rounded border border-white/10 bg-white/[0.04] text-white/70">{TOTAL_PAR}</td>
              </tr>
              <tr>
                <th className="sticky left-0 bg-[#05120f] px-2 py-2 text-left font-condensed uppercase tracking-[0.12em] text-white/55">Score</th>
                {holes.map((score, index) => (
                  <td key={`score-${index + 1}`} className={`rounded border px-2 py-2 ${getHoleScoreClass(score, COURSE_PARS[index])}`}>
                    {score || "-"}
                  </td>
                ))}
                <td className="rounded border border-white/10 bg-white/[0.04] text-white">{outTotal || "-"}</td>
                <td className="rounded border border-white/10 bg-white/[0.04] text-white">{inTotal || "-"}</td>
                <td className="rounded border border-amber-300/50 bg-amber-300/15 font-bold text-amber-100">{outTotal + inTotal || "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
