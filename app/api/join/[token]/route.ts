import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/ip";
import { SITE_NAME } from "@/lib/config";
import { formatDateTime } from "@/lib/datetime";
import { reserveSpot } from "@/lib/capacity";

export const runtime = "nodejs";

const JoinSchema = z.object({
  customerName: z.string().trim().min(1, "Your name is required").max(120),
  customerEmail: z.string().trim().email("A valid email is required").max(200),
  customerPhone: z.string().trim().min(5, "A contact phone number is required").max(40),
  claimToken: z.string().trim().max(100).optional(), // waitlist offer claim link
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // Public endpoint — throttle abuse (20 / minute / IP).
  const ip = clientIp(req);
  if (!rateLimit(`join:${ip}`, 20, 60_000).ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  if (!stripeConfigured) {
    return NextResponse.json(
      { error: "Online payments aren’t set up yet. Please contact the studio." },
      { status: 503 },
    );
  }

  const parsed = JoinSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid details" },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const cls = await prisma.class.findUnique({ where: { token } });
  if (!cls) {
    return NextResponse.json({ error: "Class not found." }, { status: 404 });
  }
  // Never start a payment for a class that has already taken place. The join page also
  // hides the form, but that's render-time only — a stale tab or a direct POST must not
  // be able to pay for a finished class.
  if (cls.classDateTime.getTime() < Date.now()) {
    return NextResponse.json(
      { error: "This class has already taken place." },
      { status: 409 },
    );
  }
  if (cls.closed) {
    return NextResponse.json(
      { error: "This class is no longer accepting bookings." },
      { status: 409 },
    );
  }

  // A valid claim token means this checkout consumes a seat already reserved for the
  // waitlist (the HELD offer), so it skips the public reservation and the "full" check.
  let offerId: string | null = null;
  if (data.claimToken) {
    const offer = await prisma.spotOffer.findUnique({ where: { claimToken: data.claimToken } });
    if (
      !offer ||
      offer.classId !== cls.id ||
      offer.status !== "HELD" ||
      offer.tier2ExpiresAt.getTime() <= Date.now()
    ) {
      return NextResponse.json(
        { error: "This offer has expired or was already claimed — but you can still book if spots are free." },
        { status: 409 },
      );
    }
    offerId = offer.id;
  }

  // Reserve a seat atomically for capacity-limited classes: the hold counts toward capacity
  // so two people can't take the last spot at the same time. Unlimited classes need no hold;
  // a claim checkout consumes its offer's reserved seat instead.
  let holdId: string | null = null;
  if (cls.capacity != null && !offerId) {
    holdId = await reserveSpot(cls.id);
    if (!holdId) {
      return NextResponse.json({ error: "Sorry, this class is full." }, { status: 409 });
    }
  }

  // Create ONLY the PaymentIntent here — no booking row yet. The booking is created
  // when payment actually succeeds (webhook / return-page reconcile), so abandoned
  // or backed-out checkouts never leave a stray booking on the roster. The hold keeps the
  // seat until then (or until it expires), and is cleared once the booking is created.
  try {
    const intent = await stripe.paymentIntents.create({
      amount: cls.amount,
      currency: cls.currency,
      automatic_payment_methods: { enabled: true },
      // Shows on the customer's Stripe email receipt — include when & where, not just the name.
      description: `${cls.danceType} · ${formatDateTime(cls.classDateTime)}${
        cls.location ? ` · ${cls.location}` : ""
      } — ${SITE_NAME}`,
      receipt_email: data.customerEmail,
      metadata: {
        classId: cls.id,
        classToken: cls.token,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        ...(offerId ? { offerId } : {}),
      },
    });
    if (holdId) {
      await prisma.spotHold.update({
        where: { id: holdId },
        data: { paymentIntentId: intent.id },
      });
    }
    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (err) {
    // Release the reservation so a failed checkout doesn't hold a seat. If this delete also
    // fails the hold self-expires, but log it so leaks are observable.
    if (holdId) {
      await prisma.spotHold
        .delete({ where: { id: holdId } })
        .catch((e) => console.error(`[spot-hold] release failed for hold ${holdId}:`, e));
    }
    console.error("Join failed for class", cls.id, err);
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 502 },
    );
  }
}
