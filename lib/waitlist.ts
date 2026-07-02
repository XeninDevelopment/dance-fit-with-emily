import "server-only";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/token";
import { spotsTaken } from "@/lib/capacity";
import { sendWaitlistOfferEmail } from "@/lib/email";
import { claimUrl } from "@/lib/config";

// Tier windows: first-in-line exclusive, then whole-waitlist first-come, then public.
export const TIER1_MS = 30 * 60 * 1000;
export const TIER2_MS = 30 * 60 * 1000;

/**
 * If a class has free seats and people waiting, reserve one seat as a SpotOffer and email
 * whoever gets first access. One HELD offer per class at a time (additional freed seats are
 * offered as each offer resolves — the cron re-calls this). Never throws.
 *
 * Called after a spot frees (refund) and from the cron sweep.
 */
export async function maybeOfferFreedSpot(classId: string): Promise<void> {
  try {
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    // Only meaningful for open, upcoming, capacity-limited classes.
    if (!cls || cls.closed || cls.capacity == null) return;
    if (cls.classDateTime.getTime() < Date.now()) return;

    // One offer in flight per class keeps the seat accounting simple and safe.
    const activeOffer = await prisma.spotOffer.count({
      where: { classId, status: "HELD", tier2ExpiresAt: { gt: new Date() } },
    });
    if (activeOffer > 0) return;

    // A free seat? (spotsTaken counts bookings + checkout holds + held offers.)
    if ((await spotsTaken(classId)) >= cls.capacity) return;

    // Front of the queue: first unconverted entry that hasn't already had (and missed) an
    // exclusive window. If everyone has missed theirs, go straight to tier 2 for all.
    const entries = await prisma.waitlistEntry.findMany({
      where: { classId, converted: false },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    });
    if (entries.length === 0) return;
    const holder = entries.find((e) => e.offeredAt == null) ?? null;

    const now = Date.now();
    const tier: 1 | 2 = holder ? 1 : 2;
    const tier1ExpiresAt = new Date(now + (holder ? TIER1_MS : 0));
    const tier2ExpiresAt = new Date(tier1ExpiresAt.getTime() + TIER2_MS);

    const offer = await prisma.spotOffer.create({
      data: {
        classId,
        claimToken: generateToken(),
        tier,
        holderEntryId: holder?.id ?? null,
        tier1ExpiresAt,
        tier2ExpiresAt,
      },
    });
    if (holder) {
      await prisma.waitlistEntry.update({
        where: { id: holder.id },
        data: { offeredAt: new Date() },
      });
    }

    const link = claimUrl(cls.token, offer.claimToken);
    const recipients = holder ? [holder] : entries;
    const deadline = holder ? tier1ExpiresAt : tier2ExpiresAt;
    for (const r of recipients) {
      await sendWaitlistOfferEmail({
        to: { name: r.name, email: r.email },
        cls,
        link,
        deadline,
        tier,
        offerId: offer.id,
      }).catch((e) => console.error(`[waitlist] offer email failed for ${r.email}:`, e));
    }
  } catch (e) {
    console.error(`[waitlist] maybeOfferFreedSpot failed for class ${classId}:`, e);
  }
}

/**
 * Advance the offer state machine. Called by the cron:
 *  - tier-1 offers past their exclusive window -> tier 2, notify the rest of the waitlist
 *  - offers past the tier-2 window -> EXPIRED (the seat simply opens to the public)
 * All transitions are conditional updates, so a double cron run can't double-advance.
 */
export async function advanceOffers(): Promise<{ toTier2: number; expired: number }> {
  const now = new Date();
  let toTier2 = 0;
  let expired = 0;

  // Expire first: anything past the final window stops counting toward capacity.
  const toExpire = await prisma.spotOffer.findMany({
    where: { status: "HELD", tier2ExpiresAt: { lte: now } },
    select: { id: true },
  });
  for (const o of toExpire) {
    const done = await prisma.spotOffer.updateMany({
      where: { id: o.id, status: "HELD" },
      data: { status: "EXPIRED" },
    });
    expired += done.count;
  }

  // Escalate tier-1 offers whose exclusive window has passed.
  const toEscalate = await prisma.spotOffer.findMany({
    where: { status: "HELD", tier: 1, tier1ExpiresAt: { lte: now }, tier2ExpiresAt: { gt: now } },
    include: { class: true },
  });
  for (const offer of toEscalate) {
    const claimed = await prisma.spotOffer.updateMany({
      where: { id: offer.id, status: "HELD", tier: 1 },
      data: { tier: 2 },
    });
    if (claimed.count === 0) continue; // raced with a claim/another cron run
    toTier2 += 1;

    // Notify everyone still waiting (except the tier-1 holder, who already has the link).
    const entries = await prisma.waitlistEntry.findMany({
      where: { classId: offer.classId, converted: false, NOT: { id: offer.holderEntryId ?? "" } },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    });
    const link = claimUrl(offer.class.token, offer.claimToken);
    for (const r of entries) {
      await sendWaitlistOfferEmail({
        to: { name: r.name, email: r.email },
        cls: offer.class,
        link,
        deadline: offer.tier2ExpiresAt,
        tier: 2,
        offerId: offer.id,
      }).catch((e) => console.error(`[waitlist] tier-2 email failed for ${r.email}:`, e));
    }
  }

  return { toTier2, expired };
}
