import Stripe from "stripe";

// Server-side Stripe client. The secret key is server-only — never expose it.
// API version is pinned so a package bump can't silently change request/response shapes.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2026-05-27.dahlia",
  typescript: true,
  appInfo: { name: "Dance Fit with Emily" },
});

/** True once a real (non-placeholder) Stripe secret key is configured. */
export const stripeConfigured =
  !!process.env.STRIPE_SECRET_KEY &&
  process.env.STRIPE_SECRET_KEY.startsWith("sk_") &&
  !process.env.STRIPE_SECRET_KEY.includes("replace_me");
