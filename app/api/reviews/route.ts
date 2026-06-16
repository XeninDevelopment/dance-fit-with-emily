import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const CreateReview = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  title: z.string().trim().max(160).optional(),
  quote: z.string().trim().min(1, "Review text is required").max(2000),
  rating: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number().int().min(1).max(5).optional(),
  ),
  featured: z.boolean().optional(),
});

// Admin-only (proxy guards /api/reviews/:path*).
export async function POST(req: NextRequest) {
  const parsed = CreateReview.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid review" },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const review = await prisma.review.create({
    data: {
      name: data.name,
      title: data.title?.trim() ? data.title.trim() : null,
      quote: data.quote,
      rating: data.rating ?? null,
      featured: data.featured ?? false,
    },
  });

  return NextResponse.json({ id: review.id }, { status: 201 });
}
