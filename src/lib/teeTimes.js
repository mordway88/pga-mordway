import { tournamentConfig } from "../config/tournamentConfig.js";
import { TEE_TIMES } from "../data/teeTimes.js";
import { normalizeName } from "./normalizeName.js";

const teeTimeMap = new Map();

Object.entries(TEE_TIMES).forEach(([round, groups]) => {
  groups.forEach(([time, players]) => {
    players.forEach((player) => {
      const easternDate = round === "2" ? "2026-05-15" : "2026-05-14";
      const [clock, meridiem] = time.split(" ");
      const [rawHour, minute] = clock.split(":");
      const hour = Number(rawHour);
      const hour24 = meridiem === "PM" ? (hour % 12) + 12 : hour % 12;
      const iso = `${easternDate}T${String(hour24).padStart(2, "0")}:${minute}:00-04:00`;
      const pacific = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/Los_Angeles",
        timeZoneName: "short",
      }).format(new Date(iso));

      teeTimeMap.set(`${round}:${normalizeName(player)}`, {
        round: Number(round),
        time,
        iso,
        displayTime: pacific,
        easternTime: `${time} ET`,
      });
    });
  });
});

export function hasTournamentStarted(now = new Date()) {
  return now >= new Date(tournamentConfig.firstTeeIso);
}

export function getCurrentRoundForSchedule(now = new Date(), config = tournamentConfig) {
  const dateKey = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: config.timezone,
  }).format(now);
  const roundEntry = Object.entries(config.roundDates || {}).find(([, roundDate]) => roundDate === dateKey);
  return Number(roundEntry?.[0] || 1);
}

export function getStaticTeeTime(normalizedName, round = getCurrentRoundForSchedule(), options = {}) {
  const { allowFallback = true } = options;
  return teeTimeMap.get(`${round}:${normalizedName}`) || (allowFallback ? teeTimeMap.get(`1:${normalizedName}`) : null) || null;
}
