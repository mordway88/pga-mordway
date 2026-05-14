function formatPacificTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
    timeZoneName: "short",
  }).format(date);
}

export function extractTeeTime(competitor) {
  const serialized = JSON.stringify(competitor ?? {});
  const isoMatch = serialized.match(/"(?:teeTime|startTime|date)"\s*:\s*"([^"]+)"/i);

  if (isoMatch?.[1]) {
    const formatted = formatPacificTime(isoMatch[1]);
    if (formatted) return formatted;
  }

  const timeMatch = serialized.match(/\b(1[0-2]|0?[1-9]):([0-5][0-9])\s?(AM|PM)\b/i);
  if (!timeMatch) return "TBA";

  const [, hour, minute, meridiem] = timeMatch;
  const hourNumber = Number(hour);
  const hour24 = meridiem.toUpperCase() === "PM" ? (hourNumber % 12) + 12 : hourNumber % 12;
  const easternGuess = new Date(Date.UTC(2026, 4, 14, hour24 + 4, Number(minute), 0));
  return formatPacificTime(easternGuess) || `${hour}:${minute} ${meridiem.toUpperCase()}`;
}
