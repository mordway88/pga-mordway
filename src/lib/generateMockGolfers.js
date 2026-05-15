import { playerGroups } from "../data/playerGroups";
import { COURSE_PARS } from "../data/coursePars";
import { formatScore } from "./formatScore";
import { normalizeName } from "./normalizeName";

function mockRound(score, seed) {
  return Array.from({ length: 18 }, (_, index) => {
    const par = COURSE_PARS[index];
    const roll = (seed + index * 7 + score) % 13;
    if (roll === 0) return par - 2;
    if (roll <= 3) return par - 1;
    if (roll >= 11) return par + 1;
    return par;
  });
}

export function generateMockGolfers() {
  const uniquePlayers = [...new Set(playerGroups.flatMap((group) => group.players))];

  return uniquePlayers.map((name, index) => {
    const score = ((index * 7) % 17) - 8;
    const status = index % 19 === 0 ? "CUT" : index % 13 === 0 ? "F" : `Thru ${(index % 17) + 1}`;
    const playState = status === "CUT" ? "out" : status === "F" ? "finishedToday" : "onCourse";
    const today = ((index * 5) % 7) - 3;

    return {
      name,
      normalizedName: normalizeName(name),
      score,
      displayScore: formatScore(score),
      status,
      playState,
      isOut: status === "CUT",
      isMissing: false,
      holeByHole: {
        1: mockRound(score, index),
        2: mockRound(score + 1, index + 3),
        3: mockRound(score - 1, index + 5),
        4: mockRound(score, index + 9),
      },
      roundScores: [formatScore(score + 2), formatScore(score - 1), formatScore(today), "-"],
      currentRoundNum: 3,
      todayScore: formatScore(today),
      teeTime: "TBA",
    };
  });
}
