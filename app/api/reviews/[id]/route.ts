import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Admin-only (proxy guards /api/reviews/:path*).
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }
  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
