import "server-only";
import { prisma } from "@/lib/prisma";

export type PublicClass = {
  token: string;
  danceType: string;
  classDateTime: Date;
  location: string | null;
  amount: number;
  currency: string;
  capacity: number | null;
  spotsLeft: number | null;
  full: boolean;
  themed: boolean;
};

/** Upcoming, open classes for the public site, with remaining spots computed. */
export async function getUpcomingClasses(limit?: number): Promise<PublicClass[]> {
  const classes = await prisma.class.findMany({
    where: { closed: false, classDateTime: { gte: new Date() } },
    orderBy: { classDateTime: "asc" },
    take: limit,
    include: {
      bookings: {
        where: { status: { in: ["PAID", "PROCESSING"] } },
        select: { id: true },
      },
    },
  });

  return classes.map((c) => {
    const spotsLeft = c.capacity != null ? Math.max(0, c.capacity - c.bookings.length) : null;
    return {
      token: c.token,
      danceType: c.danceType,
      classDateTime: c.classDateTime,
      location: c.location,
      amount: c.amount,
      currency: c.currency,
      capacity: c.capacity,
      spotsLeft,
      full: spotsLeft === 0,
      themed: c.themed,
    };
  });
}
