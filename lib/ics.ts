import { classUrl, SITE_NAME } from "@/lib/config";

// Builds an iCalendar (.ics) event for a class so customers can add it to any calendar app.
//
// Times are emitted as FLOATING local time (no "Z", no TZID). Class times are stored and
// displayed as a wall-clock (see lib/datetime.ts), so a floating time makes the calendar
// show exactly the time the customer saw on the site — and for the UK audience attending a
// UK class that is also the correct real-world time.

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// "2026-06-20T19:30Z" (stored) -> "20260620T193000" using the UTC parts (= the typed wall-clock).
function floating(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00`
  );
}

// DTSTAMP must be an absolute UTC timestamp; getUTC* parts + "Z" gives that.
function stamp(d: Date): string {
  return `${floating(d)}Z`;
}

function esc(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

// RFC 5545 §3.1: content lines must be ≤75 octets; longer ones are folded with CRLF +
// a single leading space. Fold on UTF-8 octet boundaries without splitting a character.
function fold(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  let out = "";
  let bytes = 0;
  let continuation = false;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    const limit = continuation ? 74 : 75; // continuation lines start with a space (1 octet)
    if (bytes + n > limit) {
      out += "\r\n ";
      bytes = 0;
      continuation = true;
    }
    out += ch;
    bytes += n;
  }
  return out;
}

export function classIcs(opts: {
  token: string;
  danceType: string;
  classDateTime: Date;
  location: string | null;
  now: Date;
}): string {
  const start = opts.classDateTime;
  const end = new Date(start.getTime() + 60 * 60 * 1000); // no duration field yet — default 1 hour
  const url = classUrl(opts.token);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${SITE_NAME}//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${opts.token}@dancefitwithemily.org`,
    `DTSTAMP:${stamp(opts.now)}`,
    `DTSTART:${floating(start)}`,
    `DTEND:${floating(end)}`,
    `SUMMARY:${esc(`${opts.danceType} — ${SITE_NAME}`)}`,
    opts.location ? `LOCATION:${esc(opts.location)}` : null,
    `DESCRIPTION:${esc(`Your place at ${opts.danceType}. Details: ${url}`)}`,
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean) as string[];

  return `${lines.map(fold).join("\r\n")}\r\n`;
}
