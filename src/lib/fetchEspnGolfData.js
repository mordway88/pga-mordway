import { tournamentConfig } from "../config/tournamentConfig";
import { generateSimulatedGolfers, SIMULATION_STAGES } from "./generateSimulatedGolfers";

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

  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || `Score request failed: ${response.status}`);
  }

  return payload;
}

export const fetchEspnGolfData = fetchGolfScores;

