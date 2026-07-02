import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { spotsTaken } from "@/lib/capacity";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/ip";

export const runtime = "nodejs";

// PUBLIC: join the waitlist for a full class. Deliberately outside the proxy's admin guards.
const JoinWaitlist = z.object({
  name: z.string().trim().min(1, "Your name is required").max(120),
  email: z.string().trim().email("A valid email is required").max(200),
  website: z.string().optional(), // honeypot
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const ip = clientIp(req);
  if (!rateLimit(`waitlist:${ip}`, 10, 60_000).ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  const parsed = JoinWaitlist.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid details" },
      { status: 400 },
    );
  }
  // Honeypot tripped: pretend success, store nothing.
  if (parsed.data.website?.trim()) return NextResponse.json({ ok: true }, { status: 201 });

  const name = parsed.data.name;
  const email = parsed.data.email.toLowerCase();

  const cls = await prisma.class.findUnique({ where: { token } });
  if (!cls) return NextResponse.json({ error: "Class not found." }, { status: 404 });
  if (cls.classDateTime.getTime() < Date.now()) {
    return NextResponse.json({ error: "This class has already taken place." }, { status: 409 });
  }
  if (cls.closed) {
    return NextResponse.json(
      { error: "This class is no longer accepting bookings." },
      { status: 409 },
    );
  }
  if (cls.capacity == null || (await spotsTaken(cls.id)) < cls.capacity) {
    return NextResponse.json(
      { error: "Good news — this class has spots available. You can book right now!" },
      { status: 409 },
    );
  }

  try {
    const last = await prisma.waitlistEntry.aggregate({
      where: { classId: cls.id },
      _max: { position: true },
    });
    await prisma.waitlistEntry.create({
      data: { classId: cls.id, name, email, position: (last._max.position ?? 0) + 1 },
    });
  } catch {
    // Unique (classId, email): they're already on the list — treat as success.
    return NextResponse.json({ ok: true, already: true }, { status: 200 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
