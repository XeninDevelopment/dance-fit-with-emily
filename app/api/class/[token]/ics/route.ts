import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { classIcs } from "@/lib/ics";

export const runtime = "nodejs";

// PUBLIC: returns a downloadable .ics for a class. Path is /api/class/... (singular),
// deliberately NOT under the proxy's /api/classes/:path* admin guard.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const cls = await prisma.class.findUnique({ where: { token } });
  if (!cls) return new NextResponse("Not found", { status: 404 });

  const ics = classIcs({
    token: cls.token,
    danceType: cls.danceType,
    classDateTime: cls.classDateTime,
    location: cls.location,
    now: new Date(),
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="class-${cls.token}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
