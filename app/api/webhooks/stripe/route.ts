import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { upsertBookingFromIntent } from "@/lib/bookings";

// Stripe needs the raw request body to verify the signature, and the Stripe SDK
// requires the Node runtime.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || secret.includes("replace_me")) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  // IMPORTANT: read the raw body as text — do not parse as JSON first, or the
  // signature check will fail.
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // The booking row is created here on the first real payment signal (or advanced
  // forward if it already exists). No booking exists for abandoned checkouts.
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await upsertBookingFromIntent(event.data.object, "PAID");
        break;
      case "payment_intent.processing":
        await upsertBookingFromIntent(event.data.object, "PROCESSING");
        break;
      case "payment_intent.payment_failed":
        await upsertBookingFromIntent(event.data.object, "FAILED");
        break;
      case "payment_intent.canceled":
        await upsertBookingFromIntent(event.data.object, "CANCELED");
        break;
      default:
        // Ignore other event types.
        break;
    }
  } catch (err) {
    // Returning non-2xx asks Stripe to retry delivery.
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
