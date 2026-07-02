import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { advanceOffers, maybeOfferFreedSpot } from "@/lib/waitlist";

export const runtime = "nodejs";

// Scheduler tick (Vercel Cron / any pinger). Self-authenticated with CRON_SECRET — the proxy
// does NOT guard /api/cron/*, so this must verify the bearer token itself.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Advance the offer state machine (tier-1 -> tier-2 -> expired). Idempotent.
  const advanced = await advanceOffers();

  // 2. Offer any newly free seats on classes that still have people waiting (covers seats
  //    freed while an offer was in flight, expired checkout holds, capacity raises, etc.).
  const waitingClasses = await prisma.waitlistEntry.groupBy({
    by: ["classId"],
    where: { converted: false, class: { closed: false, classDateTime: { gt: new Date() } } },
  });
  for (const w of waitingClasses) {
    await maybeOfferFreedSpot(w.classId);
  }

  // 3. Housekeeping: purge expired checkout holds globally (reserveSpot only purges per-class
  //    on its hot path; this bounds table growth for quiet classes).
  const purged = await prisma.spotHold.deleteMany({ where: { expiresAt: { lte: new Date() } } });

  return NextResponse.json({
    ok: true,
    ...advanced,
    waitingClasses: waitingClasses.length,
    purgedHolds: purged.count,
  });
}
