// Datetime helpers.
//
// The admin's <input type="datetime-local"> produces a zone-less string like
// "2026-06-20T19:30". We treat that as a UTC wall-clock (append "Z") and always
// format back in UTC, so the time displayed everywhere is exactly what was typed —
// independent of the server's timezone.

export function parseWallClock(s: string): Date {
  const trimmed = s.trim();
  const hasZone = /[zZ]$|[+-]\d{2}:\d{2}$/.test(trimmed);
  // "2026-06-20T19:30" -> "2026-06-20T19:30Z" (seconds are optional in ISO 8601).
  return new Date(hasZone ? trimmed : `${trimmed}Z`);
}

export function formatDateTime(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(d);
}

// For REAL instants (e.g. "your offer expires at 14:30") — unlike class times, these are
// actual moments in time, so format them in UK local time, not the UTC wall-clock.
export function formatUkTime(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  }).format(d);
}
