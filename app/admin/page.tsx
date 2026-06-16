import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/AdminShell";
import { formatMoney } from "@/lib/money";
import { formatDateTime } from "@/lib/datetime";
import { stripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

type ClassWithStatuses = {
  id: string;
  danceType: string;
  classDateTime: Date;
  location: string | null;
  amount: number;
  currency: string;
  capacity: number | null;
  closed: boolean;
  themed: boolean;
  bookings: { status: string }[];
};

function ClassCard({ cls }: { cls: ClassWithStatuses }) {
  const paid = cls.bookings.filter((b) => b.status === "PAID").length;
  const collected = paid * cls.amount;
  const spots = cls.capacity != null ? `${paid}/${cls.capacity}` : `${paid}`;

  return (
    <Link
      href={`/admin/class/${cls.id}`}
      className="card block transition hover:border-brand-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 truncate font-semibold text-ink">
            <span className="truncate">{cls.danceType}</span>
            {cls.themed ? (
              <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                Themed
              </span>
            ) : null}
          </p>
          <p className="text-sm text-muted">{formatDateTime(cls.classDateTime)}</p>
          {cls.location ? <p className="text-xs text-muted">{cls.location}</p> : null}
        </div>
        <span className="shrink-0 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700">
          {spots} joined
        </span>
      </div>
      <p className="mt-2 text-xs text-muted">
        {formatMoney(collected, cls.currency)} collected
        {cls.closed ? " · closed" : ""}
      </p>
    </Link>
  );
}

export default async function AdminDashboard() {
  const classes = await prisma.class.findMany({
    orderBy: { classDateTime: "asc" },
    include: { bookings: { select: { status: true } } },
    take: 500,
  });

  const now = Date.now();
  const upcoming = classes.filter((c) => c.classDateTime.getTime() >= now);
  const past = classes
    .filter((c) => c.classDateTime.getTime() < now)
    .sort((a, b) => b.classDateTime.getTime() - a.classDateTime.getTime());

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Classes</h2>
        <Link href="/admin/new" className="btn-primary !w-auto px-4 py-2.5 text-sm">
          + New class
        </Link>
      </div>

      {!stripeConfigured ? (
        <div className="card mb-4 border-amber-200 bg-amber-50/80">
          <p className="text-sm font-semibold text-amber-800">Stripe isn’t connected yet</p>
          <p className="mt-1 text-sm text-amber-700">
            Add your Stripe keys to <code className="font-mono">.env</code> so people can pay to
            join. See <span className="font-semibold">SETUP.md</span>.
          </p>
        </div>
      ) : null}

      {classes.length === 0 ? (
        <div className="card text-center">
          <p className="text-base font-semibold text-ink">No classes yet</p>
          <p className="mt-1 text-sm text-muted">
            Create a class, then share its link so people can join and pay.
          </p>
          <Link href="/admin/new" className="btn-primary mt-4">
            Create a class
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 ? (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Upcoming</h3>
              {upcoming.map((c) => (
                <ClassCard key={c.id} cls={c} />
              ))}
            </section>
          ) : null}

          {past.length > 0 ? (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Past</h3>
              {past.map((c) => (
                <ClassCard key={c.id} cls={c} />
              ))}
            </section>
          ) : null}
        </div>
      )}
    </AdminShell>
  );
}
