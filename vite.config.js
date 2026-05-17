import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tournamentConfig } from "./src/config/tournamentConfig.js";
import { buildEntriesPayload, getEntrySheetUrl } from "./src/lib/entryParsing.js";

function json(response, payload, statusCode = 200) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
}

function devApi() {
  return {
    name: "major-fantasy-dev-api",
    configureServer(server) {
      server.middlewares.use("/api/entries", async (_request, response) => {
        try {
          const sheetResponse = await fetch(getEntrySheetUrl(tournamentConfig));
          if (!sheetResponse.ok) throw new Error(`Google Sheet request failed: ${sheetResponse.status}`);
          json(response, buildEntriesPayload(await sheetResponse.text(), tournamentConfig));
        } catch (error) {
          json(response, { ok: false, error: error.message }, 500);
        }
      });

      server.middlewares.use("/api/scores", async (_request, response) => {
        try {
          const scoreResponse = await fetch(tournamentConfig.espnScoreboardUrl);
          if (!scoreResponse.ok) throw new Error(`Score feed request failed: ${scoreResponse.status}`);
          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.end(await scoreResponse.text());
        } catch (error) {
          json(response, { ok: false, error: error.message, fetchedAt: new Date().toISOString() }, 502);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    devApi(),
    react(),
    tailwindcss(),
  ],
});
