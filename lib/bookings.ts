import "server-only";
import type Stripe from "stripe";
import type { Booking, BookingStatus } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { sendConfirmationOnce } from "@/lib/email";
import { maybeOfferFreedSpot } from "@/lib/waitlist";

type SyncResult = {
  booking: Booking;
  clientSecret: string | null;
  paymentStatus: Stripe.PaymentIntent.Status | null;
};

// Lifecycle ordering — bookings only ever move forward; PAID is terminal.
export const STATUS_RANK: Record<BookingStatus, number> = {
  PENDING: 0,
  PROCESSING: 1,
  FAILED: 2,
  CANCELED: 2,
  PAID: 3,
};

/** A Stripe "charge already refunded" error — the payment is already fully refunded. */
function isAlreadyRefunded(e: unknown): boolean {
  const code =
    (e as { code?: string } | null)?.code ??
    (e as { raw?: { code?: string } } | null)?.raw?.code;
  return code === "charge_already_refunded";
}

/**
 * Safety net for a captured payment we can't honour (class deleted mid-checkout, or
 * a PI with no class). Never keep money with no record: refund a succeeded charge and
 * log loudly so the admin can see it. PROCESSING can't be refunded yet — it will hit
 * this path again as PAID once it settles.
 */
async function refundOrphanedPayment(
  pi: Stripe.PaymentIntent,
  status: BookingStatus,
  reason: string,
): Promise<void> {
  console.error(`[orphan-payment] ${status} PaymentIntent ${pi.id}: ${reason}.`);
  if (status === "PAID" && stripeConfigured) {
    await stripe.refunds
      .create({ payment_intent: pi.id }, { idempotencyKey: `orphan_refund_${pi.id}` })
      .catch((e) => console.error(`[orphan-payment] auto-refund failed for ${pi.id}:`, e));
  }
}

/**
 * Create or advance a booking from a PaymentIntent. A booking row only ever exists
 * once payment is real: it is CREATED on the first PAID/PROCESSING signal (from the
 * webhook or the return-page reconcile), so abandoned/back-button attempts never
 * leave a stray booking. Subsequent signals only move it forward.
 */
export async function upsertBookingFromIntent(
  pi: Stripe.PaymentIntent,
  status: BookingStatus,
): Promise<Booking | null> {
  const booking = await upsertBookingFromIntentInner(pi, status);
  // Every PAID observation (webhook, redelivery, return-page reconcile) attempts the branded
  // confirmation email; the claim inside makes it exactly-once and lets a failed send retry.
  if (booking?.status === "PAID") await sendConfirmationOnce(booking);
  return booking;
}

async function upsertBookingFromIntentInner(
  pi: Stripe.PaymentIntent,
  status: BookingStatus,
): Promise<Booking | null> {
  const md = pi.metadata || {};
  const classId = typeof md.classId === "string" ? md.classId : null;

  const existing = await prisma.booking.findUnique({ where: { paymentIntentId: pi.id } });
  if (existing) {
    // CANCELED is terminal (admin refund / canceled PI) — never let a later signal resurrect it.
    if (existing.status === "CANCELED") return existing;
    if (STATUS_RANK[status] > STATUS_RANK[existing.status]) {
      return prisma.booking.update({
        where: { id: existing.id },
        data: {
          status,
          paidAt: status === "PAID" ? (existing.paidAt ?? new Date()) : existing.paidAt,
        },
      });
    }
    return existing;
  }

  // No booking yet — only materialise one when payment is genuine.
  if (status !== "PAID" && status !== "PROCESSING") return null;

  // If the class is gone (deleted mid-checkout) or the PI carries no class, we can't
  // honour this — refund the charge instead of silently keeping the money.
  const cls = classId ? await prisma.class.findUnique({ where: { id: classId } }) : null;
  if (!cls) {
    await refundOrphanedPayment(
      pi,
      status,
      classId ? `class ${classId} no longer exists` : "no classId in metadata",
    );
    return null;
  }

  try {
    // Create the booking with the capacity check IN THE SAME locked statement (same per-class
    // advisory lock as reserveSpot, so join-time reservation and late-payment materialisation
    // serialise on one key). This is the last line against oversell: if the class is already
    // full with real bookings — e.g. this payment's seat hold expired and someone else took the
    // freed spot — no row is inserted and we refund rather than overbook a physical room.
    // `taken` counts only real bookings (not holds): this customer's own hold may still be live,
    // and a captured payment outranks other people's tentative checkouts.
    const customerName = typeof md.customerName === "string" ? md.customerName : "Guest";
    const customerEmail =
      typeof md.customerEmail === "string" ? md.customerEmail : (pi.receipt_email ?? "");
    const customerPhone = typeof md.customerPhone === "string" ? md.customerPhone : null;
    const paidAt = status === "PAID" ? new Date() : null;
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      WITH lock AS (
        SELECT pg_advisory_xact_lock(hashtext(${cls.id})::bigint) AS locked
      ),
      cap AS (
        SELECT capacity FROM "Class" WHERE id = ${cls.id}
      ),
      taken AS (
        SELECT (SELECT count(*) FROM "Booking" b
                  WHERE b."classId" = ${cls.id} AND b.status IN ('PAID', 'PROCESSING')) AS n
        FROM lock
      )
      INSERT INTO "Booking"
        ("id", "classId", "customerName", "customerEmail", "customerPhone", "status",
         "manual", "paymentIntentId", "clientSecret", "paidAt", "createdAt", "updatedAt")
      SELECT gen_random_uuid()::text, ${cls.id}, ${customerName}, ${customerEmail},
             ${customerPhone}, ${status}::"BookingStatus", false, ${pi.id},
             ${pi.client_secret}, ${paidAt}, now(), now()
      FROM cap, taken
      WHERE cap.capacity IS NULL OR taken.n < cap.capacity
      RETURNING "id";
    `;

    if (!rows[0]) {
      // Class full (or deleted this instant) — the seat is gone, so return the money.
      await refundOrphanedPayment(pi, status, `class ${cls.id} is full or gone (no seat to honour)`);
      return null;
    }

    // Reservation fulfilled — release the seat hold so it isn't double-counted with the booking.
    await prisma.spotHold
      .deleteMany({ where: { paymentIntentId: pi.id } })
      .catch((e) => console.error(`[spot-hold] release failed for PI ${pi.id}:`, e));

    // Waitlist claim: consume the offer (its reserved seat is now this booking) and mark the
    // payer's waitlist entry converted. Conditional update — a raced/expired offer is a no-op.
    const offerId = typeof md.offerId === "string" ? md.offerId : null;
    if (offerId) {
      await prisma.spotOffer
        .updateMany({ where: { id: offerId, status: "HELD" }, data: { status: "CLAIMED" } })
        .catch((e) => console.error(`[waitlist] offer claim failed for ${offerId}:`, e));
      await prisma.waitlistEntry
        .updateMany({
          where: { classId: cls.id, email: customerEmail.toLowerCase(), converted: false },
          data: { converted: true },
        })
        .catch((e) => console.error(`[waitlist] entry convert failed for PI ${pi.id}:`, e));
    }
    return await prisma.booking.findUniqueOrThrow({ where: { id: rows[0].id } });
  } catch {
    // Unique race: webhook and return-page both creating at once. Re-fetch and advance.
    const again = await prisma.booking.findUnique({ where: { paymentIntentId: pi.id } });
    if (again) {
      if (STATUS_RANK[status] > STATUS_RANK[again.status]) {
        return prisma.booking.update({
          where: { id: again.id },
          data: {
            status,
            paidAt: status === "PAID" ? (again.paidAt ?? new Date()) : again.paidAt,
          },
        });
      }
      return again;
    }
    // Non-unique failure (e.g. the class was deleted between the lookup above and this
    // insert -> foreign-key violation). Don't lose a captured charge and don't 500 the
    // webhook into a retry loop: refund + log, then report handled.
    await refundOrphanedPayment(pi, status, "booking insert failed (class likely deleted mid-payment)");
    return null;
  }
}

/**
 * Reconcile a booking against its Stripe PaymentIntent on read. This makes the UI
 * self-healing: even if the webhook is delayed or not configured (e.g. local dev
 * without the Stripe CLI), opening the page reflects the real payment state.
 *
 * Only ever upgrades to a Stripe-confirmed state (succeeded/processing/canceled);
 * it never downgrades a webhook-set status on a retryable intent.
 */
export async function syncBookingWithStripe(booking: Booking): Promise<SyncResult> {
  if (!stripeConfigured || !booking.paymentIntentId) {
    return { booking, clientSecret: booking.clientSecret, paymentStatus: null };
  }

  let pi: Stripe.PaymentIntent;
  try {
    pi = await stripe.paymentIntents.retrieve(booking.paymentIntentId);
  } catch {
    return { booking, clientSecret: booking.clientSecret, paymentStatus: null };
  }

  // PAID and CANCELED are terminal — never auto-change them on read. A refunded/cancelled
  // booking must not resurrect to PAID just because the PaymentIntent still reads "succeeded".
  if (booking.status === "PAID" || booking.status === "CANCELED") {
    // Retry driver for a transiently-failed confirmation email: each status-page view
    // re-attempts the claimed send (a no-op single UPDATE once it has succeeded).
    if (booking.status === "PAID") await sendConfirmationOnce(booking);
    return {
      booking,
      clientSecret: pi.client_secret ?? booking.clientSecret,
      paymentStatus: pi.status,
    };
  }

  let next: BookingStatus | null = null;
  if (pi.status === "succeeded") next = "PAID";
  else if (pi.status === "processing") next = "PROCESSING";
  else if (pi.status === "canceled") next = "CANCELED";

  let updated = booking;
  if (next && next !== booking.status) {
    updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: next,
        paidAt: next === "PAID" ? (booking.paidAt ?? new Date()) : booking.paidAt,
      },
    });
    if (updated.status === "PAID") await sendConfirmationOnce(updated);
  }

  return {
    booking: updated,
    clientSecret: pi.client_secret ?? booking.clientSecret,
    paymentStatus: pi.status,
  };
}

/**
 * Admin action: refund a paid booking via Stripe and mark it CANCELED, freeing the spot
 * (CANCELED bookings don't count toward capacity). The row is kept for audit; the refund
 * itself is recorded against the PaymentIntent in Stripe. CANCELED is terminal (see the
 * guards above), so the booking won't resurrect to PAID on a later read.
 */
export async function cancelAndRefundBooking(
  bookingId: string,
): Promise<{ ok: boolean; error?: string }> {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return { ok: false, error: "Booking not found." };
  if (booking.status === "CANCELED") return { ok: true }; // already cancelled / refunded

  if (!booking.paymentIntentId) {
    return { ok: false, error: "This was a cash booking — remove them and refund in person." };
  }
  if (booking.status === "PROCESSING") {
    return { ok: false, error: "Payment is still processing — try again once it’s confirmed." };
  }
  if (booking.status !== "PAID") {
    return { ok: false, error: "Nothing to refund — remove this attendee instead." };
  }
  if (!stripeConfigured) {
    return { ok: false, error: "Payments aren’t configured." };
  }

  // Atomically claim the cancellation: only one caller flips PAID -> CANCELED and goes on to
  // refund, so concurrent clicks / two tabs can't both issue a refund.
  const claim = await prisma.booking.updateMany({
    where: { id: bookingId, status: "PAID" },
    data: { status: "CANCELED" },
  });
  if (claim.count === 0) return { ok: true }; // someone else already cancelled/refunded it

  try {
    // Idempotency key (per booking) collapses a retry — or a racing class-delete refund of
    // the same booking — into ONE refund instead of paying out twice.
    await stripe.refunds.create(
      { payment_intent: booking.paymentIntentId },
      { idempotencyKey: `refund_${bookingId}` },
    );
    // The spot just freed — offer it to the waitlist before the public can take it.
    await maybeOfferFreedSpot(booking.classId);
    return { ok: true };
  } catch (e) {
    // Already refunded out-of-band (e.g. from the Stripe dashboard): the customer IS refunded,
    // so keep it CANCELED (spot freed) and report success rather than bricking the booking.
    if (isAlreadyRefunded(e)) {
      await maybeOfferFreedSpot(booking.classId);
      return { ok: true };
    }
    // Genuine failure: roll the status back so the spot isn't freed without a refund.
    console.error(`[refund] failed for booking ${bookingId} / PI ${booking.paymentIntentId}:`, e);
    await prisma.booking.update({ where: { id: bookingId }, data: { status: "PAID" } });
    return {
      ok: false,
      error: "Refund failed at Stripe — please try again, or refund from the Stripe dashboard.",
    };
  }
}
