import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/config";
import { getUpcomingClasses } from "@/lib/classes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/classes`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/reviews`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/gallery`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/local`, changeFrequency: "monthly", priority: 0.5 },
    // NOTE: /privacy and /terms are intentionally omitted until the legal pages are committed.
  ];

  // Enumerate upcoming class pages. Wrapped so a DB hiccup (e.g. at build time) still
  // ships the static routes rather than failing the whole sitemap.
  let classRoutes: MetadataRoute.Sitemap = [];
  try {
    const classes = await getUpcomingClasses();
    classRoutes = classes.map((c) => ({
      url: `${base}/class/${c.token}`,
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));
  } catch {
    // ignore — return static routes only
  }

  return [...staticRoutes, ...classRoutes];
}
