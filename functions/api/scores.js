import { tournamentConfig } from "../../src/config/tournamentConfig.js";
import { frozenScores } from "../../src/data/frozenScores.js";

export async function onRequestGet() {
  if (tournamentConfig.frozen) {
    return Response.json(frozenScores, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  try {
    const response = await fetch(tournamentConfig.espnScoreboardUrl, {
      cf: {
        cacheTtl: tournamentConfig.scoreCacheSeconds || 45,
        cacheEverything: true,
      },
    });

    if (!response.ok) {
      return Response.json(
        {
          ok: false,
          error: `Score feed request failed: ${response.status}`,
          eventName: tournamentConfig.displayName,
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

    return new Response(response.body, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${tournamentConfig.scoreCacheSeconds || 45}`,
      },
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error.message,
        eventName: tournamentConfig.displayName,
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
