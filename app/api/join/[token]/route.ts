import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/ip";
import { SITE_NAME } from "@/lib/config";

export const runtime = "nodejs";

const JoinSchema = z.object({
  customerName: z.string().trim().min(1, "Your name is required").max(120),
  customerEmail: z.string().trim().email("A valid email is required").max(200),
  customerPhone: z.string().trim().min(5, "A contact phone number is required").max(40),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // Public endpoint — throttle abuse (20 / minute / IP).
  const ip = clientIp(req);
  if (!rateLimit(`join:${ip}`, 20, 60_000).ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  if (!stripeConfigured) {
    return NextResponse.json(
      { error: "Online payments aren’t set up yet. Please contact the studio." },
      { status: 503 },
    );
  }

  const parsed = JoinSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid details" },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const cls = await prisma.class.findUnique({ where: { token } });
  if (!cls) {
    return NextResponse.json({ error: "Class not found." }, { status: 404 });
  }
  if (cls.closed) {
    return NextResponse.json(
      { error: "This class is no longer accepting bookings." },
      { status: 409 },
    );
  }

  // Capacity: confirmed/in-flight spots count toward the limit.
  if (cls.capacity != null) {
    const taken = await prisma.booking.count({
      where: { classId: cls.id, status: { in: ["PAID", "PROCESSING"] } },
    });
    if (taken >= cls.capacity) {
      return NextResponse.json({ error: "Sorry, this class is full." }, { status: 409 });
    }
  }

  // Create ONLY the PaymentIntent here — no booking row yet. The booking is created
  // when payment actually succeeds (webhook / return-page reconcile), so abandoned
  // or backed-out checkouts never leave a stray booking on the roster.
  try {
    const intent = await stripe.paymentIntents.create({
      amount: cls.amount,
      currency: cls.currency,
      automatic_payment_methods: { enabled: true },
      description: `${cls.danceType} — ${SITE_NAME}`,
      receipt_email: data.customerEmail,
      metadata: {
        classId: cls.id,
        classToken: cls.token,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
      },
    });
    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error("Join failed for class", cls.id, err);
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 502 },
    );
  }
}
