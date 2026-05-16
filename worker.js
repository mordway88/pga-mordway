import { tournamentConfig } from "./src/config/tournamentConfig.js";
import { buildEntriesPayload, getEntrySheetUrl } from "./src/lib/entryParsing.js";
import { buildScoresPayload } from "./src/lib/scoreApi.js";

const ENTRY_CACHE_URL = "https://major-fantasy-cache.local/entries";

function jsonResponse(payload, init = {}) {
  return Response.json(payload, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init.headers || {}),
    },
  });
}

async function readCachedEntries() {
  const cached = await caches.default.match(ENTRY_CACHE_URL);
  if (!cached) return null;
  const payload = await cached.json();
  return {
    ...payload,
    stale: true,
    source: "Google Sheets cache",
    warning: "Using the last loaded team list while Google Sheets is temporarily unavailable.",
  };
}

async function writeCachedEntries(payload) {
  await caches.default.put(
    ENTRY_CACHE_URL,
    Response.json(payload, {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    }),
  );
}

async function handleEntries() {
  const response = await fetch(getEntrySheetUrl(tournamentConfig));

  if (!response.ok) {
    const cachedPayload = await readCachedEntries();
    if (cachedPayload) return jsonResponse(cachedPayload);
    return jsonResponse({ ok: false, error: `Google Sheet request failed: ${response.status}` }, { status: 502 });
  }

  const payload = buildEntriesPayload(await response.text(), tournamentConfig);
  await writeCachedEntries(payload);
  return jsonResponse(payload);
}

async function handleScores() {
  try {
    return Response.json(await buildScoresPayload(tournamentConfig), {
      headers: {
        "Cache-Control": `public, max-age=${tournamentConfig.scoreCacheSeconds || 45}`,
      },
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: error.message,
        eventName: tournamentConfig.displayName,
        source: "ESPN",
        fetchedAt: new Date().toISOString(),
      },
      { status: 502 },
    );
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/entries") return handleEntries();
    if (url.pathname === "/api/scores") return handleScores();
    return env.ASSETS.fetch(request);
  },
};

