import "server-only";
import type Stripe from "stripe";
import type { Booking, BookingStatus } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { stripe, stripeConfigured } from "@/lib/stripe";

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
      .create({ payment_intent: pi.id })
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
  const md = pi.metadata || {};
  const classId = typeof md.classId === "string" ? md.classId : null;

  const existing = await prisma.booking.findUnique({ where: { paymentIntentId: pi.id } });
  if (existing) {
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
    return await prisma.booking.create({
      data: {
        classId: cls.id,
        customerName: typeof md.customerName === "string" ? md.customerName : "Guest",
        customerEmail:
          typeof md.customerEmail === "string" ? md.customerEmail : (pi.receipt_email ?? ""),
        customerPhone: typeof md.customerPhone === "string" ? md.customerPhone : null,
        status,
        paymentIntentId: pi.id,
        clientSecret: pi.client_secret,
        paidAt: status === "PAID" ? new Date() : null,
      },
    });
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

  // PAID is terminal — never downgrade a webhook-confirmed payment (matches the
  // webhook handler's guard). Still surface the live PI status for display.
  if (booking.status === "PAID") {
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
  }

  return {
    booking: updated,
    clientSecret: pi.client_secret ?? booking.clientSecret,
    paymentStatus: pi.status,
  };
}
