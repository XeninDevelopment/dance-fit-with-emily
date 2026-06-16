import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { toMinorUnits, SUPPORTED_CURRENCIES } from "@/lib/money";
import { generateToken } from "@/lib/token";
import { parseWallClock } from "@/lib/datetime";
import { spotifyEmbedUrl } from "@/lib/spotify";
import { classUrl } from "@/lib/config";

export const runtime = "nodejs";

const CreateClass = z.object({
  danceType: z.string().trim().min(1, "Class name is required").max(120),
  classDateTime: z.string().min(1, "Class date & time is required"),
  location: z.string().trim().max(200).optional(),
  spotifyUrl: z.string().trim().max(500).optional(),
  themed: z.boolean().optional(),
  amountMajor: z.coerce.number().positive("Price must be greater than zero").max(100000),
  currency: z.enum(SUPPORTED_CURRENCIES),
  // Optional capacity; treat empty string as "no limit".
  capacity: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number().int().positive("Capacity must be a positive whole number").max(100000).optional(),
  ),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = CreateClass.safeParse(json);
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
  if (classDate.getTime() < Date.now()) {
    return NextResponse.json(
      { error: "Class date & time must be in the future." },
      { status: 400 },
    );
  }

  const amount = toMinorUnits(data.amountMajor, data.currency);
  if (amount < 50) {
    return NextResponse.json(
      { error: "Price is too low for card payment (minimum is 0.50)." },
      { status: 400 },
    );
  }

  // Validate the Spotify link (if any) by confirming it yields a safe embed URL.
  const spotifyUrl = data.spotifyUrl?.trim() ? data.spotifyUrl.trim() : null;
  if (spotifyUrl && !spotifyEmbedUrl(spotifyUrl)) {
    return NextResponse.json(
      { error: "That doesn’t look like a valid Spotify link." },
      { status: 400 },
    );
  }

  const cls = await prisma.class.create({
    data: {
      token: generateToken(),
      danceType: data.danceType,
      classDateTime: classDate,
      location: data.location?.trim() ? data.location.trim() : null,
      spotifyUrl,
      themed: data.themed ?? false,
      amount,
      currency: data.currency,
      capacity: data.capacity ?? null,
    },
  });

  return NextResponse.json(
    { id: cls.id, token: cls.token, joinUrl: classUrl(cls.token) },
    { status: 201 },
  );
}
