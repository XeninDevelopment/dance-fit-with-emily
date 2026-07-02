import "server-only";
import { prisma } from "@/lib/prisma";

// How long a checkout reservation holds a seat before it expires and the spot frees up.
// The hold is created when the customer reaches the card form, so this only needs to cover
// entering card details — short enough that an abandoned tab doesn't block a seat for long.
export const HOLD_MS = 15 * 60 * 1000; // 15 minutes

/** Seats currently taken: confirmed/in-flight bookings + live checkout reservations + spots
 *  held for the waitlist (a HELD offer reserves its freed seat from the public). */
export async function spotsTaken(classId: string): Promise<number> {
  const now = new Date();
  const [bookings, holds, offers] = await Promise.all([
    prisma.booking.count({ where: { classId, status: { in: ["PAID", "PROCESSING"] } } }),
    prisma.spotHold.count({ where: { classId, expiresAt: { gt: now } } }),
    prisma.spotOffer.count({ where: { classId, status: "HELD", tier2ExpiresAt: { gt: now } } }),
  ]);
  return bookings + holds + offers;
}

/**
 * Atomically reserve a seat for a capacity-limited class. A per-class advisory lock plus the
 * capacity check plus the hold insert all run in ONE statement (a single implicit transaction),
 * so two concurrent buyers can't both take the last spot — and it's safe over the pgbouncer
 * pooler without an interactive transaction. `taken` is computed FROM lock so the count only
 * runs once the lock is held. Returns the new hold id, or null if the class is already full.
 */
export async function reserveSpot(classId: string): Promise<string | null> {
  const expiresAt = new Date(Date.now() + HOLD_MS);
  // NOTE: `taken` is deliberately computed `FROM lock` — that dependency is what forces the
  // advisory lock to be acquired BEFORE the counts run. Don't "simplify" it away.
  // The `purge` CTE opportunistically deletes this class's expired holds (hygiene only — the
  // counts already filter on expiresAt, and CTE deletes aren't visible to them anyway).
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    WITH lock AS (
      SELECT pg_advisory_xact_lock(hashtext(${classId})::bigint) AS locked
    ),
    purge AS (
      DELETE FROM "SpotHold"
      WHERE "classId" = ${classId} AND "expiresAt" <= now()
    ),
    cap AS (
      SELECT capacity FROM "Class" WHERE id = ${classId}
    ),
    taken AS (
      SELECT
        (SELECT count(*) FROM "Booking" b
           WHERE b."classId" = ${classId} AND b.status IN ('PAID', 'PROCESSING'))
      + (SELECT count(*) FROM "SpotHold" h
           WHERE h."classId" = ${classId} AND h."expiresAt" > now())
      + (SELECT count(*) FROM "SpotOffer" o
           WHERE o."classId" = ${classId} AND o.status = 'HELD' AND o."tier2ExpiresAt" > now()) AS n
      FROM lock
    )
    INSERT INTO "SpotHold" ("id", "classId", "expiresAt", "createdAt")
    SELECT gen_random_uuid()::text, ${classId}, ${expiresAt}, now()
    FROM cap, taken
    WHERE cap.capacity IS NULL OR taken.n < cap.capacity
    RETURNING "id";
  `;
  return rows[0]?.id ?? null;
}
