import { tournamentConfig } from "../config/tournamentConfig.js";

export function parseCsv(csv) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

export function parsePacificTimestamp(value) {
  const match = String(value || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/);
  if (!match) return null;

  const [, month, day, year, hour, minute, second] = match;
  const iso = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour.padStart(2, "0")}:${minute}:${second}-07:00`;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function rowToEntry(headers, row, index) {
  const record = Object.fromEntries(headers.map((header, cellIndex) => [header, row[cellIndex] || ""]));
  const timestamp = record.Timestamp || "";
  const submittedAt = parsePacificTimestamp(timestamp);

  return {
    id: `sheet-${index}-${record.Name || "entry"}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: record.Name || `Entry ${index}`,
    timestamp,
    submittedAt: submittedAt?.toISOString() || null,
    picks: Object.fromEntries(
      Array.from({ length: 14 }, (_, groupIndex) => {
        const group = groupIndex + 1;
        return [`group${group}`, record[`Group${group}`] || ""];
      }),
    ),
  };
}

export function getEntrySheetUrl(config = tournamentConfig) {
  return `https://docs.google.com/spreadsheets/d/${config.sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(config.sheetName)}`;
}

export function buildEntriesPayload(csv, config = tournamentConfig, now = new Date()) {
  const [headers, ...rows] = parseCsv(csv);
  const lockDate = new Date(config.entryLockIso);
  const allEntries = rows
    .map((row, index) => rowToEntry(headers, row, index + 1))
    .filter((entry) => entry.name && Object.values(entry.picks).some(Boolean));
  const entries = allEntries.filter((entry) => !entry.submittedAt || new Date(entry.submittedAt) <= lockDate);

  return {
    entries,
    totalRows: allEntries.length,
    lockedOutRows: allEntries.length - entries.length,
    locked: now >= lockDate,
    lockIso: config.entryLockIso,
    source: "Google Sheets",
    sheetName: config.sheetName,
    fetchedAt: now.toISOString(),
  };
}

