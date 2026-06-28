import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { syncBookingWithStripe, upsertBookingFromIntent } from "@/lib/bookings";
import { PayShell, SummaryCard } from "@/components/PayUI";
import { ClassGrid } from "@/components/ClassGrid";
import { ShareLink } from "@/components/ShareLink";
import { getUpcomingClasses } from "@/lib/classes";
import { classUrl, SITE_NAME, CONTACT } from "@/lib/config";

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

    if (booking.status === "CANCELED") {
      return (
        <PayShell subtitle="Booking cancelled">
          <div className="card text-center">
            <p className="text-lg font-bold text-ink">This booking was cancelled</p>
            <p className="mt-2 text-sm text-muted">
              If you were charged, a refund has been issued to your original payment method.
            </p>
            <Link href="/classes" className="btn-primary mt-4">
              See other classes
            </Link>
            <p className="mt-3 text-sm text-muted">
              Questions?{" "}
              <a href={`mailto:${CONTACT.email}`} className="font-medium text-brand-700 hover:underline">
                Email Emily
              </a>
              .
            </p>
          </div>
        </PayShell>
      );
    }

    const isPaid = booking.status === "PAID" || paymentStatus === "succeeded";

    if (isPaid) {
      const others = (await getUpcomingClasses(4)).filter((c) => c.token !== token).slice(0, 2);

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

          <a href={`/api/class/${token}/ics`} className="btn-secondary mt-3">
            Add to calendar
          </a>

          <div className="card mt-4">
            <p className="font-semibold text-ink">What happens next</p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted">
              <li>• Pop the date in your calendar (button above).</li>
              <li>• Arrive 5 minutes early in comfy clothes you can move in.</li>
              <li>• Bring water — you’ll need it!</li>
            </ul>
          </div>

          <div className="card mt-4 text-center">
            <p className="font-semibold text-ink">Bring a friend 💃</p>
            <p className="mb-3 mt-1 text-sm text-muted">
              Dancing’s better together — share this class.
            </p>
            <ShareLink
              url={classUrl(token)}
              shareTitle={`${cls.danceType} · ${SITE_NAME}`}
              shareText={`Come to ${cls.danceType} with me!`}
            />
          </div>

          {others.length > 0 ? (
            <div className="mt-8">
              <h2 className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                More classes you might like
              </h2>
              <ClassGrid classes={others} />
            </div>
          ) : null}
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
        <p className="mt-3 text-sm text-muted">
          Trouble paying?{" "}
          <a href={`mailto:${CONTACT.email}`} className="font-medium text-brand-700 hover:underline">
            Email Emily
          </a>
          .
        </p>
      </div>
    </PayShell>
  );
}
