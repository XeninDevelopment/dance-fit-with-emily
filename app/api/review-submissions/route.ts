import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/ip";

export const runtime = "nodejs";

// PUBLIC endpoint — intentionally outside the proxy's /api/reviews/:path* guard.
// Visitors submit a review here; it is stored as `pending` and only appears on the
// site after the admin approves it. Abuse is mitigated with a rate limit + honeypot.
const SubmitReview = z.object({
  name: z.string().trim().min(1, "Please add your name").max(80),
  rating: z.coerce
    .number({ message: "Please choose a star rating" })
    .int()
    .min(1, "Please choose a star rating")
    .max(5),
  comment: z.string().trim().min(4, "Please share a little more").max(1500),
  website: z.string().optional(), // honeypot — real visitors never fill this
});

export async function POST(req: NextRequest) {
  // Throttle abuse: 5 submissions / 10 minutes / IP.
  const ip = clientIp(req);
  if (!rateLimit(`review-submit:${ip}`, 5, 10 * 60_000).ok) {
    return NextResponse.json(
      { error: "Thanks! You’ve submitted a few already — please try again later." },
      { status: 429 },
    );
  }

  const parsed = SubmitReview.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Please check your review and try again." },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Honeypot tripped (a bot filled the hidden field): pretend success, store nothing.
  if (data.website && data.website.trim()) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  await prisma.review.create({
    data: {
      name: data.name,
      quote: data.comment,
      rating: data.rating,
      pending: true, // awaits admin approval before showing publicly
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
