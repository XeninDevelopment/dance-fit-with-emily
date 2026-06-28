import { NextRequest, NextResponse } from "next/server";
import { cancelAndRefundBooking } from "@/lib/bookings";

export const runtime = "nodejs";

// Admin-only (proxy guards /api/bookings/:path*). Refund a paid booking and free its spot.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await cancelAndRefundBooking(id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error || "Could not refund." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
