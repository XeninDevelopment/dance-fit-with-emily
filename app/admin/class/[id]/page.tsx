import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/AdminShell";
import { StatusBadge } from "@/components/StatusBadge";
import { ShareLink } from "@/components/ShareLink";
import { AddAttendeeForm } from "./AddAttendeeForm";
import { DeleteAttendeeButton } from "./DeleteAttendeeButton";
import { DeleteClassButton } from "./DeleteClassButton";
import { EditClassForm } from "./EditClassForm";
import { SpotifyEmbed } from "@/components/SpotifyEmbed";
import { formatMoney } from "@/lib/money";
import { formatDateTime } from "@/lib/datetime";
import { mapsDirectionsUrl } from "@/lib/maps";
import { classUrl, SITE_NAME } from "@/lib/config";

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-right text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cls = await prisma.class.findUnique({
    where: { id },
    include: { bookings: { orderBy: { createdAt: "asc" } } },
  });
  if (!cls) notFound();

  const paid = cls.bookings.filter((b) => b.status === "PAID").length;
  const collected = paid * cls.amount;
  const link = classUrl(cls.token);

  return (
    <AdminShell>
      <div className="mb-4">
        <Link
          href="/admin"
          className="-mx-2 inline-flex min-h-11 items-center px-2 text-sm font-medium text-muted hover:text-brand-700"
        >
          ← All classes
        </Link>
      </div>

      <div className="card">
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold text-ink">{cls.danceType}</p>
          {cls.themed ? (
            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
              Themed
            </span>
          ) : null}
        </div>
        <p className="text-sm text-muted">{formatDateTime(cls.classDateTime)}</p>
        {cls.location ? (
          <p className="text-sm text-muted">
            {cls.location}{" "}
            <a
              href={mapsDirectionsUrl(cls.location)}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-brand-700 hover:underline"
            >
              · Directions
            </a>
          </p>
        ) : null}
        <dl className="mt-3 divide-y divide-brand-100">
          <Row label="Price" value={formatMoney(cls.amount, cls.currency)} />
          <Row
            label="Joined"
            value={
              cls.capacity != null
                ? `${paid} / ${cls.capacity}${paid > cls.capacity ? " (over capacity)" : ""}`
                : `${paid}`
            }
          />
          <Row label="Collected" value={formatMoney(collected, cls.currency)} />
        </dl>
      </div>

      <div className="card mt-4">
        <h3 className="font-semibold text-ink">Join link</h3>
        <p className="mb-3 mt-0.5 text-sm text-muted">
          Share this so people can book and pay for {cls.danceType}.
        </p>
        <ShareLink
          url={link}
          shareTitle={`${SITE_NAME} — ${cls.danceType}`}
          shareText={`Book onto ${cls.danceType} (${formatDateTime(cls.classDateTime)}):`}
        />
      </div>

      <SpotifyEmbed url={cls.spotifyUrl} title="Playlist preview" />

      <div className="card mt-4">
        <h3 className="font-semibold text-ink">Edit details</h3>
        <p className="mb-3 mt-0.5 text-sm text-muted">
          Add a Spotify playlist, fix the time/location, change capacity, or close bookings.
        </p>
        <EditClassForm
          id={cls.id}
          danceType={cls.danceType}
          classDateTimeLocal={cls.classDateTime.toISOString().slice(0, 16)}
          location={cls.location}
          spotifyUrl={cls.spotifyUrl}
          themed={cls.themed}
          capacity={cls.capacity}
          closed={cls.closed}
        />
      </div>

      <div className="card mt-4">
        <h3 className="font-semibold text-ink">Attendees ({cls.bookings.length})</h3>
        {cls.bookings.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No one has joined yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-brand-100">
            {cls.bookings.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {b.customerName}
                    {b.manual ? " · cash" : ""}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {b.customerEmail}
                    {b.customerPhone ? ` · ${b.customerPhone}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <StatusBadge status={b.status} />
                  <DeleteAttendeeButton id={b.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card mt-4">
        <h3 className="font-semibold text-ink">Add attendee</h3>
        <p className="mb-3 mt-0.5 text-sm text-muted">For someone who paid in cash / in person.</p>
        <AddAttendeeForm classId={cls.id} />
      </div>

      <div className="mt-6">
        <DeleteClassButton id={cls.id} hasPaid={paid > 0} />
      </div>
    </AdminShell>
  );
}
