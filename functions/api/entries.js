import { tournamentConfig } from "../../src/config/tournamentConfig.js";
import { buildEntriesPayload, getEntrySheetUrl } from "../../src/lib/entryParsing.js";

export async function onRequestGet() {
  const response = await fetch(getEntrySheetUrl(tournamentConfig));

  if (!response.ok) {
    return Response.json({ error: `Google Sheet request failed: ${response.status}` }, { status: 502 });
  }

  const csv = await response.text();
  return Response.json(buildEntriesPayload(csv, tournamentConfig), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

