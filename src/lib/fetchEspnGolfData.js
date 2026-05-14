import { parseEspnCompetitor } from "./parseEspnCompetitor";
import { generateSimulatedGolfers, SIMULATION_STAGES } from "./generateSimulatedGolfers";

const ESPN_SCOREBOARD_URL = "https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard";
const ENABLE_SIMULATION = import.meta.env.VITE_ENABLE_SIMULATION === "true";

function eventLooksLikePgaChampionship(event) {
  const name = `${event?.name || ""} ${event?.shortName || ""}`.toLowerCase();
  return name.includes("pga championship");
}

function getCompetitorsFromEvent(event) {
  const competitions = event?.competitions || [];
  return competitions.flatMap((competition) => competition?.competitors || []);
}

export async function fetchEspnGolfData() {
  if (ENABLE_SIMULATION) {
    const stage = new URLSearchParams(window.location.search).get("sim") || "pre";
    const simulationStage = SIMULATION_STAGES.includes(stage) ? stage : "pre";

    return {
      eventName: `PGA Championship Simulation - ${simulationStage}`,
      golfers: generateSimulatedGolfers(simulationStage),
      fetchedAt: new Date().toISOString(),
    };
  }

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
