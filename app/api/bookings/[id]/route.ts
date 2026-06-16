import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe, stripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";

// Admin-only (guarded by proxy.ts matcher /api/bookings/:path*).
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Best-effort: cancel the PaymentIntent if it's still cancelable (i.e. not paid),
  // so we don't leave a live payment link behind. Ignore if it can't be canceled.
  if (stripeConfigured && booking.paymentIntentId && booking.status !== "PAID") {
    await stripe.paymentIntents.cancel(booking.paymentIntentId).catch(() => {});
  }

  await prisma.booking.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
