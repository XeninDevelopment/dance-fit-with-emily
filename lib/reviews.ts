import "server-only";
import { prisma } from "@/lib/prisma";
import type { Review } from "@/app/generated/prisma/client";

/** All reviews, featured (case studies) first, then newest. */
export async function getReviews(limit?: number): Promise<Review[]> {
  return prisma.review.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}
