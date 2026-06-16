import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { parseWallClock } from "@/lib/datetime";
import { spotifyEmbedUrl } from "@/lib/spotify";

export const runtime = "nodejs";

// Editable class details (price/currency are fixed once created). Used to add the
// Spotify playlist after creation, fix the time/location, change capacity, or close.
const UpdateClass = z.object({
  danceType: z.string().trim().min(1, "Class name is required").max(120),
  classDateTime: z.string().min(1, "Class date & time is required"),
  location: z.string().trim().max(200).optional(),
  spotifyUrl: z.string().trim().max(500).optional(),
  themed: z.boolean().optional(),
  capacity: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number().int().positive("Capacity must be a positive whole number").max(100000).optional(),
  ),
  closed: z.boolean().optional(),
});

// Admin-only: update editable details of a class.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cls = await prisma.class.findUnique({ where: { id } });
  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const parsed = UpdateClass.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid class details" },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const classDate = parseWallClock(data.classDateTime);
  if (Number.isNaN(classDate.getTime())) {
    return NextResponse.json({ error: "Invalid class date & time" }, { status: 400 });
  }
  // Unlike create, edit does NOT enforce a future date — the admin must be able to fix
  // or annotate (e.g. add a playlist to) a class that has already taken place.

  const spotifyUrl = data.spotifyUrl?.trim() ? data.spotifyUrl.trim() : null;
  if (spotifyUrl && !spotifyEmbedUrl(spotifyUrl)) {
    return NextResponse.json(
      { error: "That doesn’t look like a valid Spotify link." },
      { status: 400 },
    );
  }

  // Don't allow capacity to be set below the number of people already booked.
  if (data.capacity != null) {
    const taken = await prisma.booking.count({
      where: { classId: id, status: { in: ["PAID", "PROCESSING"] } },
    });
    if (data.capacity < taken) {
      return NextResponse.json(
        { error: `Capacity can’t be below the ${taken} already booked.` },
        { status: 409 },
      );
    }
  }

  await prisma.class.update({
    where: { id },
    data: {
      danceType: data.danceType,
      classDateTime: classDate,
      location: data.location?.trim() ? data.location.trim() : null,
      spotifyUrl,
      themed: data.themed ?? cls.themed,
      capacity: data.capacity ?? null,
      closed: data.closed ?? cls.closed,
    },
  });

  return NextResponse.json({ ok: true });
}

// Admin-only (proxy guards /api/classes/:path*). Deletes a class and all its bookings
// (cascade), cancelling any unpaid PaymentIntents first so no live links are left behind.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cls = await prisma.class.findUnique({ where: { id }, include: { bookings: true } });
  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  if (stripeConfigured) {
    for (const b of cls.bookings) {
      if (b.paymentIntentId && b.status !== "PAID") {
        await stripe.paymentIntents.cancel(b.paymentIntentId).catch(() => {});
      }
    }
  }

  await prisma.class.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
