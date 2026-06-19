import type { NextConfig } from "next";

// Security response headers for a live payment site. Notes:
// - X-Frame-Options: DENY stops OUR pages being framed (clickjacking). Stripe's own
//   iframes live *inside* our page (we're the top frame), so this doesn't affect them.
// - Permissions-Policy intentionally omits `payment` so Stripe wallet buttons (Apple/
//   Google Pay) keep working; we only lock down sensors we never use.
// - A full Content-Security-Policy (allowing js.stripe.com, *.stripe.com, open.spotify.com)
//   is the recommended follow-up.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
