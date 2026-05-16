import { useMemo, useState } from "react";
import { COURSE_PARS, IN_PAR, OUT_PAR, TOTAL_PAR } from "../data/coursePars";
import { getHoleScoreClass } from "../lib/getHoleScoreClass";

function sum(values) {
  return values.reduce((total, value) => total + (Number(value) || 0), 0);
}

function getHoleResult(score, par) {
  if (score === null || score === undefined || score === "" || !par) return "-";
  const diff = Number(score) - Number(par);
  if (!Number.isFinite(diff)) return "-";
  if (diff <= -2) return "Eagle+";
  if (diff === -1) return "Birdie";
  if (diff === 0) return "Par";
  if (diff === 1) return "Bogey";
  if (diff >= 2) return "Double+";
  return "-";
}

function getEmptyScorecardMessage(golfer, activeRound) {
  if (golfer.playState === "notStartedToday" && activeRound === golfer.currentRoundNum) {
    return `Round ${activeRound} starts at ${golfer.teeTime || "TBA"}.`;
  }
  if (!golfer.hasStarted) return `Starts ${golfer.teeTime || "TBA"}.`;
  if (activeRound > (golfer.currentRoundNum || 1)) return `Round ${activeRound} has not started.`;
  if (golfer.status === "F" || golfer.roundScores?.[activeRound - 1] !== "-") return "Hole details unavailable for this round.";
  return "Hole details are not available yet.";
}

function MobileNineCard({ title, holes, startIndex }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
      <div className="mb-2 font-condensed text-base font-bold uppercase text-white">{title}</div>
      <div className="grid gap-1.5">
        {holes.map((score, index) => {
          const holeNumber = startIndex + index + 1;
          const par = COURSE_PARS[startIndex + index];
          return (
            <div key={holeNumber} className="grid grid-cols-[minmax(0,1fr)_128px] items-center gap-3 rounded-md border border-white/10 bg-[#071a15] px-3 py-2 text-sm">
              <div className="flex min-w-0 items-baseline gap-3">
                <span className="font-condensed font-bold text-white/82">Hole {holeNumber}</span>
                <span className="text-white/55">Par {par}</span>
              </div>
              <div className="grid grid-cols-[52px_64px] items-center gap-3">
                <span className={`grid h-9 w-9 place-items-center justify-self-end rounded border text-center font-bold ${getHoleScoreClass(score, par)}`}>{score || "-"}</span>
                <span className="text-left text-white/64">{getHoleResult(score, par)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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
        Scorecard appears after tee off. Tee time: <span className="font-semibold text-white/82">{golfer.teeTime || "TBA"}</span>.
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
              <span className="sm:hidden">R{round}</span>
              <span className="hidden sm:inline">Round {round}</span>
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
          {getEmptyScorecardMessage(golfer, activeRound)}
        </div>
      ) : (
        <>
        <div className="grid gap-3 xl:hidden">
          <MobileNineCard title="Front 9" holes={holes.slice(0, 9)} startIndex={0} />
          <MobileNineCard title="Back 9" holes={holes.slice(9)} startIndex={9} />
        </div>
        <div className="scorecard-scroll hidden max-w-full overflow-x-auto overscroll-x-contain rounded-lg border border-white/10 bg-[#06130f]/70 p-2 xl:block">
          <table className="w-max min-w-[900px] border-separate border-spacing-1 text-center text-sm">
            <tbody>
              <tr>
                <th className="sticky left-0 z-10 min-w-24 rounded bg-[#05120f] px-2 py-2 text-left font-condensed uppercase tracking-[0.12em] text-white/55 shadow-[8px_0_14px_rgba(0,0,0,.35)]">Hole</th>
                {COURSE_PARS.map((_, index) => (
                  <th key={`hole-${index + 1}`} className="w-10 rounded bg-white/10 px-2 py-2 font-condensed text-white">
                    {index + 1}
                  </th>
                ))}
                <th className="rounded bg-white/10 px-2 py-2 font-condensed text-white">OUT</th>
                <th className="rounded bg-white/10 px-2 py-2 font-condensed text-white">IN</th>
                <th className="rounded bg-amber-300 px-2 py-2 font-condensed text-emerald-950">TOT</th>
              </tr>
              <tr>
                <th className="sticky left-0 z-10 min-w-24 rounded bg-[#05120f] px-2 py-2 text-left font-condensed uppercase tracking-[0.12em] text-white/55 shadow-[8px_0_14px_rgba(0,0,0,.35)]">Par</th>
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
                <th className="sticky left-0 z-10 min-w-24 rounded bg-[#05120f] px-2 py-2 text-left font-condensed uppercase tracking-[0.12em] text-white/55 shadow-[8px_0_14px_rgba(0,0,0,.35)]">Score</th>
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
        </>
      )}
      {hasHoleData && (
        <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/55">
          {[
            ["Eagle+", "bg-yellow-200 text-yellow-900 border-yellow-300"],
            ["Birdie", "bg-emerald-100 text-emerald-800 border-emerald-300"],
            ["Par", "bg-white text-slate-700 border-slate-200"],
            ["Bogey", "bg-red-100 text-red-800 border-red-300"],
            ["Double+", "bg-blue-100 text-blue-800 border-blue-300"],
          ].map(([label, className]) => (
            <span key={label} className={`rounded border px-2 py-1 ${className}`}>{label}</span>
          ))}
        </div>
      )}
    </div>
  );
}
