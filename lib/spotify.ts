// Validates a Spotify share link/URI and returns a safe embed URL, or null.
// We never render user input directly into an iframe — we extract the (type, id)
// and rebuild the URL against the fixed open.spotify.com/embed origin.

const ALLOWED_TYPES = new Set(["playlist", "album", "track", "artist"]);

export function spotifyEmbedUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  const s = input.trim();

  // URI form: spotify:playlist:ID
  const uri = s.match(/^spotify:(playlist|album|track|artist):([A-Za-z0-9]+)$/);
  if (uri) return `https://open.spotify.com/embed/${uri[1]}/${uri[2]}`;

  // URL form: https://open.spotify.com/[intl-xx/]playlist/ID?...
  try {
    const u = new URL(s);
    if (u.hostname !== "open.spotify.com" && u.hostname !== "play.spotify.com") return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const typeIdx = parts.findIndex((p) => ALLOWED_TYPES.has(p));
    if (typeIdx === -1) return null;
    const type = parts[typeIdx];
    const id = parts[typeIdx + 1];
    if (!id || !/^[A-Za-z0-9]+$/.test(id)) return null;
    return `https://open.spotify.com/embed/${type}/${id}`;
  } catch {
    return null;
  }
}
