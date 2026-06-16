import { spotifyEmbedUrl } from "@/lib/spotify";

/** Renders a Spotify preview if `url` is a valid public Spotify link, else nothing. */
export function SpotifyEmbed({
  url,
  title = "Music for this class",
}: {
  url: string | null;
  title?: string;
}) {
  const embed = spotifyEmbedUrl(url);
  if (!embed) return null;

  return (
    <div className="card mt-4">
      <h3 className="mb-2 font-semibold text-ink">{title}</h3>
      <iframe
        src={embed}
        title="Spotify playlist preview"
        className="w-full rounded-xl"
        height={352}
        style={{ border: 0 }}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      />
    </div>
  );
}
