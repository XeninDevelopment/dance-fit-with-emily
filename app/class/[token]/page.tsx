import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PayShell, SummaryCard, PayReassurance } from "@/components/PayUI";
import { JoinAndPay } from "./JoinAndPay";
import { WaitlistForm } from "@/components/WaitlistForm";
import { SpotifyEmbed } from "@/components/SpotifyEmbed";
import { formatMoney } from "@/lib/money";
import { formatDateTime } from "@/lib/datetime";
import { stripeConfigured } from "@/lib/stripe";
import { spotsTaken } from "@/lib/capacity";
import { SITE_NAME, CONTACT } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const cls = await prisma.class.findUnique({ where: { token } });
  if (!cls) return { title: "Class not found" };
  const desc = `Book ${cls.danceType} on ${formatDateTime(cls.classDateTime)}${
    cls.location ? ` at ${cls.location}` : ""
  } — ${formatMoney(cls.amount, cls.currency)} per person.`;
  return {
    title: cls.danceType,
    description: desc,
    openGraph: { title: `${cls.danceType} · ${SITE_NAME}`, description: desc },
    twitter: { card: "summary_large_image", title: `${cls.danceType} · ${SITE_NAME}`, description: desc },
  };
}

function ContactLine() {
  return (
    <p className="mt-3 text-sm text-muted">
      Need a hand?{" "}
      <a href={`mailto:${CONTACT.email}`} className="font-medium text-brand-700 hover:underline">
        Email Emily
      </a>{" "}
      or message{" "}
      <a
        href={CONTACT.instagram}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-brand-700 hover:underline"
      >
        {CONTACT.instagramHandle}
      </a>
      .
    </p>
  );
}

export default async function ClassJoinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const cls = await prisma.class.findUnique({ where: { token } });

  if (!cls) {
    return (
      <PayShell subtitle="Join this class">
        <div className="card text-center">
          <p className="text-lg font-bold text-ink">Class not found</p>
          <p className="mt-2 text-sm text-muted">
            This link isn’t valid — please double-check it.
          </p>
          <Link href="/classes" className="btn-primary mt-4">
            See upcoming classes
          </Link>
          <ContactLine />
        </div>
      </PayShell>
    );
  }

  const details = {
    danceType: cls.danceType,
    classDateTime: cls.classDateTime,
    location: cls.location,
    amount: cls.amount,
    currency: cls.currency,
  };

  let spotsLeft: number | null = null;
  if (cls.capacity != null) {
    spotsLeft = Math.max(0, cls.capacity - (await spotsTaken(cls.id)));
  }

  const isPast = cls.classDateTime.getTime() < Date.now();

  const blocked = isPast
    ? {
        title: "This class has already taken place",
        body: "This class is in the past — but there are more coming up.",
      }
    : cls.closed
      ? { title: "Bookings closed", body: "This class is no longer accepting new bookings." }
      : spotsLeft === 0
        ? { title: "Class full", body: "Sorry, all spots for this class have been taken." }
        : null;

  const lowSpots = spotsLeft != null && spotsLeft > 0 && spotsLeft <= 3;

  return (
    <PayShell subtitle="Join this class">
      <SummaryCard details={details} />
      {!blocked && spotsLeft != null ? (
        lowSpots ? (
          <p className="mt-2 text-center">
            <span className="badge-pending">
              Only {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} left!
            </span>
          </p>
        ) : (
          <p className="mt-2 text-center text-xs text-muted">{spotsLeft} spots left</p>
        )
      ) : null}

      <div className="card mt-4">
        {blocked ? (
          <div className="text-center">
            <p className="text-base font-semibold text-ink">{blocked.title}</p>
            <p className="mt-1 text-sm text-muted">{blocked.body}</p>
            {/* Full (but not past/closed): capture the demand instead of losing it. */}
            {!isPast && !cls.closed && spotsLeft === 0 ? (
              <WaitlistForm token={cls.token} />
            ) : (
              <Link href="/classes" className="btn-primary mt-4">
                See upcoming classes
              </Link>
            )}
            <ContactLine />
          </div>
        ) : stripeConfigured ? (
          <JoinAndPay token={cls.token} amountLabel={formatMoney(cls.amount, cls.currency)} />
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted">Online booking isn’t available right now.</p>
            <ContactLine />
          </div>
        )}
      </div>

      {!blocked && stripeConfigured ? <PayReassurance /> : null}

      <SpotifyEmbed url={cls.spotifyUrl} title="What we’ll dance to" />
    </PayShell>
  );
}
