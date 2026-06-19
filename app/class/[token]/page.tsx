import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PayShell, SummaryCard } from "@/components/PayUI";
import { JoinAndPay } from "./JoinAndPay";
import { SpotifyEmbed } from "@/components/SpotifyEmbed";
import { formatMoney } from "@/lib/money";
import { formatDateTime } from "@/lib/datetime";
import { stripeConfigured } from "@/lib/stripe";
import { SITE_NAME } from "@/lib/config";

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
            This link isn’t valid. Please double-check it or contact the studio.
          </p>
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
    const taken = await prisma.booking.count({
      where: { classId: cls.id, status: { in: ["PAID", "PROCESSING"] } },
    });
    spotsLeft = Math.max(0, cls.capacity - taken);
  }

  const blocked = cls.closed
    ? { title: "Bookings closed", body: "This class is no longer accepting new bookings." }
    : spotsLeft === 0
      ? { title: "Class full", body: "Sorry, all spots for this class have been taken." }
      : null;

  return (
    <PayShell subtitle="Join this class">
      <SummaryCard details={details} />
      {!blocked && spotsLeft != null ? (
        <p className="mt-2 text-center text-xs text-muted">
          {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} left
        </p>
      ) : null}

      <div className="card mt-4">
        {blocked ? (
          <div className="text-center">
            <p className="text-base font-semibold text-ink">{blocked.title}</p>
            <p className="mt-1 text-sm text-muted">{blocked.body}</p>
          </div>
        ) : stripeConfigured ? (
          <JoinAndPay token={cls.token} amountLabel={formatMoney(cls.amount, cls.currency)} />
        ) : (
          <p className="text-center text-sm text-muted">
            Online booking isn’t available yet. Please contact the studio.
          </p>
        )}
      </div>

      <SpotifyEmbed url={cls.spotifyUrl} title="What we’ll dance to" />
    </PayShell>
  );
}
