// White disco ball + sparkles. `size` is the pixel width/height (real SVG attributes,
// so it can never balloon). `id` must be unique per instance on a page.
// `animated` makes the mirror surface scroll horizontally (spinning on its vertical
// axis) + a gentle bob + twinkling sparkles — auto-disabled for reduced motion.
//
// The surface pattern (facets + vertical meridian lines) repeats every 7 user units
// and is translated by -7, so the loop is seamless. Latitude lines + base stay fixed.
export function DiscoBall({
  size = 32,
  id = "db",
  animated = false,
}: {
  size?: number;
  id?: string;
  animated?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      className={animated ? "disco-bob" : undefined}
      style={{ display: "block" }}
    >
      <defs>
        <clipPath id={`${id}-c`}>
          <circle cx="11.5" cy="14" r="7.5" />
        </clipPath>
      </defs>

      <line x1="11.5" y1="3" x2="11.5" y2="6.5" stroke="#fff" strokeWidth="1" />
      <circle cx="11.5" cy="2.3" r="1" stroke="#fff" strokeWidth="1" fill="none" />

      <g clipPath={`url(#${id}-c)`}>
        <rect x="2" y="6" width="20" height="16" fill="#fff" />

        <g className={animated ? "disco-rotate" : undefined}>
          <g fill="#cdd5f7">
            <rect x="-7" y="6.5" width="3.5" height="3.5" />
            <rect x="0" y="6.5" width="3.5" height="3.5" />
            <rect x="7" y="6.5" width="3.5" height="3.5" />
            <rect x="14" y="6.5" width="3.5" height="3.5" />
            <rect x="21" y="6.5" width="3.5" height="3.5" />
            <rect x="28" y="6.5" width="3.5" height="3.5" />
            <rect x="-3.5" y="10.5" width="3.5" height="3.5" />
            <rect x="3.5" y="10.5" width="3.5" height="3.5" />
            <rect x="10.5" y="10.5" width="3.5" height="3.5" />
            <rect x="17.5" y="10.5" width="3.5" height="3.5" />
            <rect x="24.5" y="10.5" width="3.5" height="3.5" />
            <rect x="-7" y="14.5" width="3.5" height="3.5" />
            <rect x="0" y="14.5" width="3.5" height="3.5" />
            <rect x="7" y="14.5" width="3.5" height="3.5" />
            <rect x="14" y="14.5" width="3.5" height="3.5" />
            <rect x="21" y="14.5" width="3.5" height="3.5" />
            <rect x="28" y="14.5" width="3.5" height="3.5" />
            <rect x="-3.5" y="18.5" width="3.5" height="3" />
            <rect x="3.5" y="18.5" width="3.5" height="3" />
            <rect x="10.5" y="18.5" width="3.5" height="3" />
            <rect x="17.5" y="18.5" width="3.5" height="3" />
            <rect x="24.5" y="18.5" width="3.5" height="3" />
          </g>
          <g stroke="#9fb0f0" strokeWidth="0.6">
            <line x1="-7" y1="6" x2="-7" y2="22" />
            <line x1="-3.5" y1="6" x2="-3.5" y2="22" />
            <line x1="0" y1="6" x2="0" y2="22" />
            <line x1="3.5" y1="6" x2="3.5" y2="22" />
            <line x1="7" y1="6" x2="7" y2="22" />
            <line x1="10.5" y1="6" x2="10.5" y2="22" />
            <line x1="14" y1="6" x2="14" y2="22" />
            <line x1="17.5" y1="6" x2="17.5" y2="22" />
            <line x1="21" y1="6" x2="21" y2="22" />
            <line x1="24.5" y1="6" x2="24.5" y2="22" />
            <line x1="28" y1="6" x2="28" y2="22" />
          </g>
        </g>

        <g stroke="#9fb0f0" strokeWidth="0.6">
          <line x1="2" y1="10" x2="21" y2="10" />
          <line x1="2" y1="14" x2="21" y2="14" />
          <line x1="2" y1="18" x2="21" y2="18" />
        </g>
      </g>

      <path
        d="M20.6 7 l0.45 1.2 1.2 0.45 -1.2 0.45 -0.45 1.2 -0.45 -1.2 -1.2 -0.45 1.2 -0.45z"
        fill="#fff"
        className={animated ? "disco-twinkle" : undefined}
      />
      <path
        d="M21 14 l0.32 0.85 0.85 0.32 -0.85 0.32 -0.32 0.85 -0.32 -0.85 -0.85 -0.32 0.85 -0.32z"
        fill="#fff"
        className={animated ? "disco-twinkle" : undefined}
        style={animated ? { animationDelay: "1.3s" } : undefined}
      />
    </svg>
  );
}
