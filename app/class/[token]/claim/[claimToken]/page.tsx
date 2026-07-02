import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PayShell, SummaryCard, PayReassurance } from "@/components/PayUI";
import { JoinAndPay } from "../../JoinAndPay";
import { formatMoney } from "@/lib/money";
import { formatUkTime } from "@/lib/datetime";
import { stripeConfigured } from "@/lib/stripe";
import { CONTACT } from "@/lib/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Claim your spot",
  robots: { index: false }, // private link — keep it out of search engines
};

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ token: string; claimToken: string }>;
}) {
  const { token, claimToken } = await params;

  const offer = await prisma.spotOffer.findUnique({
    where: { claimToken },
    include: { class: true },
  });
  const cls = offer?.class;
  const valid =
    !!offer &&
    !!cls &&
    cls.token === token &&
    offer.status === "HELD" &&
    offer.tier2ExpiresAt.getTime() > Date.now() &&
    cls.classDateTime.getTime() > Date.now() &&
    !cls.closed;

  if (!valid || !cls) {
    return (
      <PayShell subtitle="Waitlist offer">
        <div className="card text-center">
          <p className="text-lg font-bold text-ink">This offer is no longer available</p>
          <p className="mt-2 text-sm text-muted">
            It may have been claimed or expired — but if a spot is still free, you can book the
            usual way.
          </p>
          <Link href={`/class/${token}`} className="btn-primary mt-4">
            Go to the class page
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

  const deadline = offer.tier === 1 ? offer.tier1ExpiresAt : offer.tier2ExpiresAt;
  const details = {
    danceType: cls.danceType,
    classDateTime: cls.classDateTime,
    location: cls.location,
    amount: cls.amount,
    currency: cls.currency,
  };

  return (
    <PayShell subtitle="Claim your spot">
      <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-center">
        <p className="text-sm font-semibold text-emerald-800">
          🎟 A spot is reserved for you{offer.tier === 1 ? "" : " (first come, first served)"} —
          book by {formatUkTime(deadline)} to claim it.
        </p>
      </div>

      <SummaryCard details={details} />

      <div className="card mt-4">
        {stripeConfigured ? (
          <JoinAndPay
            token={cls.token}
            amountLabel={formatMoney(cls.amount, cls.currency)}
            claimToken={claimToken}
          />
        ) : (
          <p className="text-center text-sm text-muted">
            Online booking isn’t available right now — please email{" "}
            <a href={`mailto:${CONTACT.email}`} className="font-medium text-brand-700 hover:underline">
              {CONTACT.email}
            </a>
            .
          </p>
        )}
      </div>

      <PayReassurance />
    </PayShell>
  );
}
