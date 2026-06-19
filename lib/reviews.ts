import "server-only";
import { prisma } from "@/lib/prisma";
import type { Review } from "@/app/generated/prisma/client";

/** Approved reviews for the public site, featured (case studies) first, then newest. */
export async function getReviews(limit?: number): Promise<Review[]> {
  return prisma.review.findMany({
    where: { pending: false },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

/** Visitor-submitted reviews awaiting admin moderation, newest first. */
export async function getPendingReviews(): Promise<Review[]> {
  return prisma.review.findMany({
    where: { pending: true },
    orderBy: { createdAt: "desc" },
  });
}
