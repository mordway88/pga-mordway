import { tournamentConfig } from "../../src/config/tournamentConfig.js";
import { buildScoresPayload } from "../../src/lib/scoreApi.js";

export async function onRequestGet() {
  try {
    return Response.json(await buildScoresPayload(tournamentConfig), {
      headers: {
        "Cache-Control": `public, max-age=${tournamentConfig.scoreCacheSeconds || 45}`,
      },
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error.message,
        eventName: tournamentConfig.displayName,
        source: "ESPN",
        fetchedAt: new Date().toISOString(),
      },
      {
        status: 502,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}

