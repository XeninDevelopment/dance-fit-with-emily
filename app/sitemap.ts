import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = baseUrl();
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/classes`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/reviews`, changeFrequency: "weekly", priority: 0.7 },
  ];
}
