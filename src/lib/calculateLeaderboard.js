import { COUNTING_PLAYERS } from "./constants.js";
import { formatScore } from "./formatScore.js";
import { tournamentConfig } from "../config/tournamentConfig.js";
import { applyProjectedPayouts } from "./prizePayouts.js";
import { normalizeName } from "./normalizeName.js";
import { getCurrentRoundForSchedule, getStaticTeeTime } from "./teeTimes.js";

export function getEntryPlayers(entry) {
  if (Array.isArray(entry.players)) return entry.players;
  if (!entry.picks) return [];

  return Array.from({ length: 14 }, (_, index) => entry.picks[`group${index + 1}`] || "");
}

function createMissingGolfer(name, groupNumber, reason = "Not matched to live scoring") {
  const normalizedName = normalizeName(name) || `missinggroup${groupNumber}`;
  const scheduledRound = getCurrentRoundForSchedule();
  const staticTeeTime = getStaticTeeTime(normalizedName, scheduledRound, { allowFallback: false });

  return {
    name: name || `Missing Group ${groupNumber}`,
    normalizedName,
    score: 999,
    displayScore: "NO MATCH",
    status: reason,
    playState: "missing",
    isOut: false,
    isMissing: true,
    isCounting: false,
    holeByHole: {},
    roundScores: ["-", "-", "-", "-"],
    todayScore: "-",
    teeTime: staticTeeTime?.displayTime || "TBA",
    teeTimeSourceIso: staticTeeTime?.iso || null,
    scheduledRound,
  };
}

function hasStartedGolf(golfer) {
  return golfer.isOut || golfer.status === "F" || /^Thru/i.test(golfer.status || "") || golfer.todayScore !== "-" || golfer.roundScores.some((score) => score !== "-");
}

function getNextTeeTime(playersData) {
  const scheduled = playersData
    .map((player) => ({
      player,
      time: player.teeTime,
      sortable: Date.parse(player.teeTimeSourceIso || player.teeTimeIso || ""),
    }))
    .filter((item) => item.time && item.time !== "TBA");

  scheduled.sort((a, b) => {
    if (Number.isFinite(a.sortable) && Number.isFinite(b.sortable)) return a.sortable - b.sortable;
    return a.time.localeCompare(b.time);
  });

  return scheduled[0]?.time || "Tee times ready";
}

export function calculateLeaderboard(entries, golfers, options = {}) {
  const scoringStarted = Boolean(options.scoringStarted);
  const normalizedGolfers = new Map(golfers.map((golfer) => [golfer.normalizedName, golfer]));

  const calculatedEntries = entries.map((entry) => {
    const duplicateCounts = new Map();
    getEntryPlayers(entry).forEach((playerName) => {
      const normalizedName = normalizeName(playerName);
      if (!normalizedName) return;
      duplicateCounts.set(normalizedName, (duplicateCounts.get(normalizedName) || 0) + 1);
    });
    const duplicateNames = [...duplicateCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([normalizedName]) => getEntryPlayers(entry).find((playerName) => normalizeName(playerName) === normalizedName))
      .filter(Boolean);
    const seenNames = new Set();

    const playersData = getEntryPlayers(entry)
      .map((playerName, index) => {
        const groupNumber = index + 1;
        const normalizedName = normalizeName(playerName);
        if (!normalizedName) return { ...createMissingGolfer(playerName, groupNumber, `Missing Group ${groupNumber} pick`), groupNumber };

        const isDuplicate = seenNames.has(normalizedName);
        seenNames.add(normalizedName);

        if (isDuplicate) {
          return {
            ...createMissingGolfer(playerName, groupNumber, "Duplicate golfer selected"),
            displayScore: "DUP",
            isDuplicate: true,
            duplicateName: playerName,
            groupNumber,
          };
        }

        const live = normalizedGolfers.get(normalizedName);
        return live ? { ...live, name: playerName, groupNumber } : { ...createMissingGolfer(playerName, groupNumber), groupNumber };
      });

    if (scoringStarted) {
      playersData.sort((a, b) => a.score - b.score || a.groupNumber - b.groupNumber);
    }

    // Scoring guardrail: always count the best 10 slots after sorting all 14.
    // True missing/duplicate slots carry a 999 penalty, so incomplete or invalid teams
    // cannot look artificially better than complete teams.
    playersData.forEach((player, index) => {
      player.isCounting = scoringStarted && index < COUNTING_PLAYERS;
      player.hasStarted = hasStartedGolf(player);
    });

    const countingPlayers = playersData.filter((player) => player.isCounting).slice(0, COUNTING_PLAYERS);
    const totalScore = countingPlayers.reduce((sum, player) => sum + player.score, 0);
    const onCourseCount = playersData.filter((player) => player.playState === "onCourse").length;
    const finishedCount = playersData.filter((player) => player.playState === "finishedToday").length;
    const outCount = playersData.filter((player) => ["CUT", "WD", "DQ"].includes(player.status)).length;
    const nextTeeTime = getNextTeeTime(playersData);
    const unmatchedPlayers = playersData.filter((player) => player.isMissing);
    const incompletePlayers = playersData.filter((player) => /^Missing Group/i.test(player.status || ""));
    const duplicatePlayers = playersData.filter((player) => player.isDuplicate);
    const validationIssues = [
      ...unmatchedPlayers.map((player) => `${player.name}: ${player.status}`),
      ...duplicateNames.map((name) => `Duplicate golfer selected: ${name}`),
    ];
    const reviewNeeded = scoringStarted && validationIssues.length > 0;

    return {
      ...entry,
      playersData,
      totalScore: scoringStarted ? totalScore : null,
      displayTotal: scoringStarted ? formatScore(totalScore) : "Not started",
      scoringStarted,
      onCourseCount,
      finishedCount,
      outCount,
      nextTeeTime,
      unmatchedPlayers,
      incompletePlayers,
      duplicatePlayers,
      validationIssues,
      reviewNeeded,
    };
  });

  calculatedEntries.sort((a, b) => {
    if (!scoringStarted) return a.name.localeCompare(b.name);
    return a.totalScore - b.totalScore || a.name.localeCompare(b.name);
  });

  calculatedEntries.forEach((entry, index) => {
    entry.rank = !scoringStarted
      ? index + 1
      : index > 0 && entry.totalScore === calculatedEntries[index - 1].totalScore
      ? calculatedEntries[index - 1].rank
      : index + 1;
    const tied = scoringStarted && calculatedEntries.some((team) => team.id !== entry.id && team.totalScore === entry.totalScore);
    entry.rankLabel = tied ? `T${entry.rank}` : String(entry.rank);
  });

  if (scoringStarted) {
    applyProjectedPayouts(calculatedEntries, tournamentConfig.prizes);
  }

  return calculatedEntries;
}
