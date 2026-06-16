import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

// Next.js 16 "proxy" (formerly middleware). Runs on the Node.js runtime.
// Guards the admin area and the booking API. jose (Web Crypto) verifies the session.
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const authed = await verifySessionToken(token);

  // The login page is public; bounce already-authed admins straight to the dashboard.
  if (pathname === "/admin/login") {
    return authed
      ? NextResponse.redirect(new URL("/admin", req.url))
      : NextResponse.next();
  }

  if (!authed) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    if (pathname !== "/admin") loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Protect admin pages and the admin-only class/booking APIs.
  // Public endpoints are intentionally excluded: the join API (/api/join/*),
  // the Stripe webhook (/api/webhooks/*), and the login endpoint (/api/auth/*).
  matcher: [
    "/admin/:path*",
    "/api/classes/:path*",
    "/api/bookings/:path*",
    "/api/reviews/:path*",
  ],
};
