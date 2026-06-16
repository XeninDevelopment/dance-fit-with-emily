import type { NextRequest } from "next/server";

// Best-effort client IP for rate-limiting. Prefer the platform-set x-real-ip; if only
// x-forwarded-for is present, take the RIGHTMOST (proxy-appended) hop rather than the
// leftmost, which a client can spoof. Behind a trusted proxy (e.g. Vercel) these are
// set by the platform.
export function clientIp(req: NextRequest): string {
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const hops = xff.split(",").map((p) => p.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1];
  }
  return "unknown";
}
