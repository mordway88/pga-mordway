import { tournamentConfig } from "../config/tournamentConfig.js";
import { parseEspnCompetitor } from "./parseEspnCompetitor.js";

function eventMatches(event, config = tournamentConfig) {
  const haystack = `${event?.name || ""} ${event?.shortName || ""}`.toLowerCase();
  return (config.espnEventMatchers || []).some((matcher) => haystack.includes(String(matcher).toLowerCase()));
}

function getCompetitorsFromEvent(event) {
  const competitions = event?.competitions || [];
  return competitions.flatMap((competition) => competition?.competitors || []);
}

export function selectScoreEvent(events = [], config = tournamentConfig) {
  return events.find((event) => eventMatches(event, config)) || events[0] || null;
}

export async function buildScoresPayload(config = tournamentConfig, fetchImpl = fetch) {
  const response = await fetchImpl(config.espnScoreboardUrl);
  if (!response.ok) throw new Error(`ESPN request failed: ${response.status}`);

  const payload = await response.json();
  const event = selectScoreEvent(payload?.events || [], config);
  const competitors = getCompetitorsFromEvent(event);

  if (!competitors.length) {
    throw new Error("ESPN returned no golfer data for the selected event.");
  }

  return {
    ok: true,
    eventName: event?.name || config.displayName,
    selectedEventId: event?.id || null,
    source: "ESPN",
    fetchedAt: new Date().toISOString(),
    golfers: competitors.map(parseEspnCompetitor),
  };
}

