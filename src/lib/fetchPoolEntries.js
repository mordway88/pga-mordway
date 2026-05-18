import { tournamentConfig } from "../config/tournamentConfig";
import { frozenEntries } from "../data/frozenEntries";

export async function fetchPoolEntries() {
  if (tournamentConfig.frozen) return frozenEntries;

  const response = await fetch("/api/entries", {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Entry sheet request failed: ${response.status}`);
  }

  return response.json();
}
