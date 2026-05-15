import { MANUAL_SCORE_OVERRIDES, MANUAL_STATUS_OVERRIDES } from "../data/manualOverrides";
import { formatScore } from "./formatScore";
import { normalizeName } from "./normalizeName";
import { parseGolfScore } from "./parseGolfScore";
import { extractTeeTime } from "./extractTeeTime";
import { getCurrentRoundForSchedule, getStaticTeeTime } from "./teeTimes";

function pickFirst(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function getStatusText(competitor, scoreStr, normalizedName) {
  const override = MANUAL_STATUS_OVERRIDES[normalizedName];
  if (override) return override;

  const statusText = [
    competitor?.status?.type?.description,
    competitor?.status?.type?.detail,
    competitor?.status?.displayValue,
    competitor?.status?.description,
    competitor?.curatedRank?.displayValue,
    scoreStr,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (statusText.includes("disqualified") || /\bdq\b/.test(statusText)) return "DQ";
  if (statusText.includes("withdraw") || /\bwd\b/.test(statusText)) return "WD";
  if (statusText.includes("cut") || /\bcut\b/.test(statusText)) return "CUT";

  return null;
}

function parseRoundScores(linescores = []) {
  const roundScores = ["-", "-", "-", "-"];
  linescores.forEach((round) => {
    const period = Number(round?.period ?? round?.value ?? 0);
    if (period >= 1 && period <= 4) {
      roundScores[period - 1] = pickFirst(round?.displayValue, round?.score, round?.value, "-");
    }
  });
  return roundScores.map((value) => (value === 0 ? "E" : String(value)));
}

function parseHoleByHole(linescores = []) {
  return linescores.reduce((roundMap, round) => {
    const roundNum = Number(round?.period ?? 0);
    if (roundNum < 1 || roundNum > 4) return roundMap;

    const holes = round?.linescores || round?.competitions || [];
    roundMap[roundNum] = Array.from({ length: 18 }, (_, index) => {
      const hole = holes.find((item) => Number(item?.period ?? item?.hole ?? item?.value) === index + 1);
      const raw = pickFirst(hole?.value, hole?.displayValue, hole?.score, null);
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : null;
    });

    return roundMap;
  }, {});
}

function getActiveRound(linescores = []) {
  return [...linescores].reverse().find((round) => Array.isArray(round?.linescores) && round.linescores.length > 0) || null;
}

function getRound(linescores = [], roundNumber) {
  return linescores.find((round) => Number(round?.period ?? 0) === Number(roundNumber)) || null;
}

export function parseEspnCompetitor(competitor) {
  const athlete = competitor?.athlete || competitor?.competitor || competitor;
  const name = pickFirst(athlete?.displayName, athlete?.fullName, athlete?.name, competitor?.displayName, competitor?.name, "Unknown Golfer");
  const normalizedName = normalizeName(name);

  const scoreStr = String(
    pickFirst(
      competitor?.score?.displayValue,
      competitor?.score,
      competitor?.curatedRank?.current,
      competitor?.linescores?.at?.(-1)?.displayValue,
      "E",
    ),
  );

  const detectedStatus = getStatusText(competitor, scoreStr, normalizedName);
  const score = parseGolfScore(scoreStr);
  const override = MANUAL_SCORE_OVERRIDES[normalizedName];
  const linescores = competitor?.linescores || [];
  const activeRound = getActiveRound(linescores);
  const scheduledRound = getCurrentRoundForSchedule();
  const currentRound = getRound(linescores, scheduledRound);
  const currentRoundHolesPlayed = currentRound?.linescores?.length || 0;
  const thru = pickFirst(competitor?.status?.period, competitor?.thru, competitor?.currentHole);
  const isOut = ["CUT", "WD", "DQ"].includes(detectedStatus);
  const staticTeeTime = getStaticTeeTime(normalizedName, scheduledRound, { allowFallback: false });
  const teeTime = extractTeeTime(competitor);
  const displayTeeTime = teeTime === "TBA" ? staticTeeTime?.displayTime || "TBA" : teeTime;
  const activeRoundNumber = Number(activeRound?.period ?? 0);
  const statusThru = activeRoundNumber === scheduledRound ? thru : null;
  const currentRoundFinished = currentRoundHolesPlayed >= 18 || (activeRoundNumber === scheduledRound && competitor?.status?.type?.completed);
  const playState = detectedStatus
    ? "out"
    : currentRoundFinished
      ? "finishedToday"
      : currentRoundHolesPlayed > 0 || statusThru
        ? "onCourse"
        : "notStartedToday";
  const status = override?.status ?? detectedStatus ?? (
    playState === "finishedToday"
      ? "F"
      : playState === "onCourse"
        ? `Thru ${statusThru || currentRoundHolesPlayed}`
        : `Starts ${displayTeeTime}`
  );
  const todayScore = playState === "notStartedToday"
    ? "-"
    : pickFirst(competitor?.todayScore, competitor?.score?.today, currentRound?.displayValue, competitor?.status?.displayValue, "-");

  return {
    name,
    normalizedName,
    score: override?.score ?? score ?? 999,
    displayScore: override?.displayScore ?? (score === null ? detectedStatus || "-" : formatScore(score)),
    status,
    playState,
    isOut,
    isMissing: false,
    holeByHole: parseHoleByHole(linescores),
    roundScores: parseRoundScores(linescores),
    currentRoundNum: scheduledRound,
    todayScore,
    teeTime: displayTeeTime,
    teeTimeSourceIso: staticTeeTime?.iso || null,
    scheduledRound,
  };
}
