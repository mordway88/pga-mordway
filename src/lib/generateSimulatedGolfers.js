import { playerGroups } from "../data/playerGroups";
import { TEE_TIMES } from "../data/teeTimes";
import { formatScore } from "./formatScore";
import { normalizeName } from "./normalizeName";
import { getStaticTeeTime } from "./teeTimes";

export const SIMULATION_STAGES = ["pre", "r1-early", "r1-late", "r2-cut", "r3-moving", "final"];

const COURSE_PARS = [4, 4, 4, 4, 3, 4, 4, 5, 4, 4, 4, 3, 4, 5, 4, 3, 4, 4];

function hashName(name) {
  return [...normalizeName(name)].reduce((total, char) => total + char.charCodeAt(0), 0);
}

function uniqueFieldNames() {
  const groupedPlayers = playerGroups.flatMap((group) => group.players);
  const teeTimePlayers = Object.values(TEE_TIMES).flatMap((round) => round.flatMap(([, players]) => players));
  return [...new Set([...groupedPlayers, ...teeTimePlayers])].sort((a, b) => a.localeCompare(b));
}

function buildRoundScore(name, round, holesPlayed = 18) {
  const seed = hashName(name) + round * 17;
  let total = 0;
  const holes = COURSE_PARS.map((par, index) => {
    if (index >= holesPlayed) return null;
    const roll = (seed + index * 11) % 19;
    let diff = 0;
    if (roll === 0) diff = -2;
    else if (roll <= 4) diff = -1;
    else if (roll >= 17) diff = 2;
    else if (roll >= 14) diff = 1;

    total += diff;
    return par + diff;
  });

  return { holes, total };
}

function getStageConfig(stage) {
  const normalizedStage = SIMULATION_STAGES.includes(stage) ? stage : "pre";

  return {
    "pre": { currentRound: 1, completedRounds: 0, holesPlayed: 0, cutActive: false, finished: false },
    "r1-early": { currentRound: 1, completedRounds: 0, holesPlayed: 7, cutActive: false, finished: false },
    "r1-late": { currentRound: 1, completedRounds: 0, holesPlayed: 16, cutActive: false, finished: false },
    "r2-cut": { currentRound: 2, completedRounds: 2, holesPlayed: 18, cutActive: true, finished: false },
    "r3-moving": { currentRound: 3, completedRounds: 2, holesPlayed: 10, cutActive: true, finished: false },
    "final": { currentRound: 4, completedRounds: 4, holesPlayed: 18, cutActive: true, finished: true },
  }[normalizedStage];
}

function getCutStatus(name, totalScore, stageConfig) {
  if (!stageConfig.cutActive) return null;
  const seed = hashName(name);
  if (seed % 59 === 0) return "WD";
  if (seed % 83 === 0) return "DQ";
  if (totalScore > 6 || seed % 13 === 0) return "CUT";
  return null;
}

function buildRoundScores(name, stageConfig) {
  const holeByHole = {};
  const roundScores = ["-", "-", "-", "-"];
  let totalScore = 0;
  let todayScore = "-";

  for (let round = 1; round <= 4; round += 1) {
    const holesPlayed = round < stageConfig.currentRound
      ? 18
      : round === stageConfig.currentRound
        ? stageConfig.holesPlayed
        : 0;

    if (!holesPlayed) continue;

    const roundResult = buildRoundScore(name, round, holesPlayed);
    holeByHole[round] = roundResult.holes;

    if (holesPlayed === 18) {
      roundScores[round - 1] = formatScore(roundResult.total);
    }

    totalScore += roundResult.total;
    if (round === stageConfig.currentRound) {
      todayScore = formatScore(roundResult.total);
    }
  }

  return { holeByHole, roundScores, totalScore, todayScore };
}

export function generateSimulatedGolfers(stage = "pre") {
  const stageConfig = getStageConfig(stage);

  return uniqueFieldNames().map((name) => {
    const normalizedName = normalizeName(name);
    const scheduledRound = stageConfig.currentRound <= 2 ? stageConfig.currentRound : 2;
    const staticTeeTime = getStaticTeeTime(normalizedName, scheduledRound);

    if (stageConfig.completedRounds === 0 && stageConfig.holesPlayed === 0) {
      return {
        name,
        normalizedName,
        score: 0,
        displayScore: "E",
        status: `Starts ${staticTeeTime?.displayTime || "TBA"}`,
        isOut: false,
        isMissing: false,
        holeByHole: {},
        roundScores: ["-", "-", "-", "-"],
        currentRoundNum: 1,
        todayScore: "-",
        teeTime: staticTeeTime?.displayTime || "TBA",
        teeTimeSourceIso: staticTeeTime?.iso || null,
        scheduledRound,
      };
    }

    const { holeByHole, roundScores, totalScore, todayScore } = buildRoundScores(name, stageConfig);
    const cutStatus = getCutStatus(name, totalScore, stageConfig);
    const activeStatus = stageConfig.finished
      ? "F"
      : stageConfig.holesPlayed >= 18
        ? "F"
        : `Thru ${stageConfig.holesPlayed}`;
    const status = cutStatus || activeStatus;

    return {
      name,
      normalizedName,
      score: cutStatus ? totalScore + 30 : totalScore,
      displayScore: cutStatus ? cutStatus : formatScore(totalScore),
      status,
      isOut: Boolean(cutStatus),
      isMissing: false,
      holeByHole,
      roundScores,
      currentRoundNum: stageConfig.currentRound,
      todayScore: cutStatus ? "-" : todayScore,
      teeTime: staticTeeTime?.displayTime || "TBA",
      teeTimeSourceIso: staticTeeTime?.iso || null,
      scheduledRound,
    };
  });
}
