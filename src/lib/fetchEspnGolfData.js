import { parseEspnCompetitor } from "./parseEspnCompetitor";

const ESPN_SCOREBOARD_URL = "https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard";

function eventLooksLikePgaChampionship(event) {
  const name = `${event?.name || ""} ${event?.shortName || ""}`.toLowerCase();
  return name.includes("pga championship");
}

function getCompetitorsFromEvent(event) {
  const competitions = event?.competitions || [];
  return competitions.flatMap((competition) => competition?.competitors || []);
}

export async function fetchEspnGolfData() {
  const response = await fetch(ESPN_SCOREBOARD_URL);
  if (!response.ok) throw new Error(`ESPN request failed: ${response.status}`);

  const payload = await response.json();
  const events = payload?.events || [];
  const event = events.find(eventLooksLikePgaChampionship) || events[0];
  const competitors = getCompetitorsFromEvent(event);

  if (!competitors.length) {
    throw new Error("ESPN returned no golfer data for the active event.");
  }

  return {
    eventName: event?.name || "PGA Championship",
    golfers: competitors.map(parseEspnCompetitor),
    fetchedAt: new Date().toISOString(),
  };
}
