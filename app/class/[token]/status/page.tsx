import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { syncBookingWithStripe, upsertBookingFromIntent } from "@/lib/bookings";
import { PayShell, SummaryCard } from "@/components/PayUI";

export const dynamic = "force-dynamic";

export default async function ClassStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ payment_intent?: string }>;
}) {
  const { token } = await params;
  const { payment_intent } = await searchParams;

  let found = payment_intent
    ? await prisma.booking.findFirst({
        where: { paymentIntentId: payment_intent },
        include: { class: true },
      })
    : null;

  // No booking yet (webhook lag, or webhooks not configured locally) — materialise it
  // from the live PaymentIntent so the customer sees the right result immediately.
  if (!found && payment_intent && stripeConfigured) {
    try {
      const pi = await stripe.paymentIntents.retrieve(payment_intent);
      const status =
        pi.status === "succeeded" ? "PAID" : pi.status === "processing" ? "PROCESSING" : null;
      // Only materialise from a PI that actually belongs to this class link.
      if (status && pi.metadata?.classToken === token) {
        await upsertBookingFromIntent(pi, status);
        found = await prisma.booking.findFirst({
          where: { paymentIntentId: payment_intent },
          include: { class: true },
        });
      }
    } catch {
      // fall through to the "not completed" view
    }
  }

  // Guard against a mismatched/hand-crafted URL showing another class's confirmation.
  if (found && found.class.token !== token) {
    found = null;
  }

  if (found) {
    const cls = found.class;
    const details = {
      danceType: cls.danceType,
      classDateTime: cls.classDateTime,
      location: cls.location,
      amount: cls.amount,
      currency: cls.currency,
    };
    const { booking, paymentStatus } = await syncBookingWithStripe(found);
    const isPaid = booking.status === "PAID" || paymentStatus === "succeeded";

    if (isPaid) {
      return (
        <PayShell subtitle="Booking confirmed">
          <div className="card border-emerald-200 bg-emerald-50/70 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">
              ✓
            </div>
            <p className="text-lg font-bold text-emerald-800">You’re booked in!</p>
            <p className="mt-1 text-sm text-emerald-700">
              A receipt has been emailed to {found.customerEmail}.
            </p>
          </div>
          <div className="mt-4">
            <SummaryCard details={details} customerName={found.customerName} />
          </div>
        </PayShell>
      );
    }

    return (
      <PayShell subtitle="Booking status">
        <div className="card text-center">
          <p className="text-lg font-bold text-ink">Payment processing</p>
          <p className="mt-2 text-sm text-muted">
            Your payment is still processing. We’ll email a receipt once it’s confirmed.
          </p>
          <Link
            href={`/class/${token}/status?payment_intent=${payment_intent}`}
            className="btn-secondary mt-4"
          >
            Refresh status
          </Link>
        </div>
      </PayShell>
    );
  }

  // No successful/processing payment — let them try again.
  return (
    <PayShell subtitle="Booking status">
      <div className="card text-center">
        <p className="text-lg font-bold text-ink">Payment not completed</p>
        <p className="mt-2 text-sm text-muted">
          Your payment didn’t go through. You can try again below.
        </p>
        <Link href={`/class/${token}`} className="btn-primary mt-4">
          Try again
        </Link>
      </div>
    </PayShell>
  );
}
