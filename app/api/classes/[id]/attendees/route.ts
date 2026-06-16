import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const ManualAttendee = z.object({
  customerName: z.string().trim().min(1, "Name is required").max(120),
  customerEmail: z.string().trim().email("A valid email is required").max(200),
  customerPhone: z.string().trim().max(40).optional(),
});

// Admin-only: add an attendee who paid in person/cash. Marked PAID + manual, no Stripe.
// Capacity is intentionally NOT enforced here — this is a trusted-admin override for
// walk-ins; the roster surfaces an "over capacity" note if it exceeds the limit.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cls = await prisma.class.findUnique({ where: { id } });
  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const parsed = ManualAttendee.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid details" },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const booking = await prisma.booking.create({
    data: {
      classId: cls.id,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone?.trim() ? data.customerPhone.trim() : null,
      status: "PAID",
      manual: true,
      paidAt: new Date(),
    },
  });

  return NextResponse.json({ id: booking.id }, { status: 201 });
}
