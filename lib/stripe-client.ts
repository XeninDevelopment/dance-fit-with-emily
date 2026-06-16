import { loadStripe, type Stripe } from "@stripe/stripe-js";

// Browser-side Stripe.js singleton. Only the PUBLISHABLE key is used here.
let stripePromise: Promise<Stripe | null> | undefined;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
    );
  }
  return stripePromise;
}
