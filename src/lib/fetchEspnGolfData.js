import { tournamentConfig } from "../config/tournamentConfig";
import { generateSimulatedGolfers, SIMULATION_STAGES } from "./generateSimulatedGolfers";
import { normalizeScoreboardPayload } from "./scoreApi";

const ENABLE_SIMULATION = import.meta.env.VITE_ENABLE_SIMULATION === "true";

export async function fetchGolfScores() {
  if (ENABLE_SIMULATION) {
    const stage = new URLSearchParams(window.location.search).get("sim") || "pre";
    const simulationStage = SIMULATION_STAGES.includes(stage) ? stage : "pre";

    return {
      ok: true,
      eventName: `${tournamentConfig.displayName} Simulation - ${simulationStage}`,
      golfers: generateSimulatedGolfers(simulationStage),
      source: "Simulation",
      fetchedAt: new Date().toISOString(),
    };
  }

  const response = await fetch("/api/scores");
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload) {
    throw new Error(payload?.error || `Score request failed: ${response.status}`);
  }

  if (payload.ok && payload.golfers) return payload;
  return normalizeScoreboardPayload(payload, tournamentConfig);
}

export const fetchEspnGolfData = fetchGolfScores;
