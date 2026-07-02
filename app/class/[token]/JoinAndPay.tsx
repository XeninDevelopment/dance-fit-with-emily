"use client";

import { useRef, useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { Appearance } from "@stripe/stripe-js";
import { getStripe } from "@/lib/stripe-client";

type Details = { name: string; email: string; phone: string };

const appearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#db2777",
    colorText: "#1f1430",
    colorDanger: "#e11d48",
    fontFamily: "Poppins, system-ui, sans-serif",
    borderRadius: "12px",
    spacingUnit: "4px",
  },
};

function CheckoutForm({
  token,
  amountLabel,
  details,
  onEdit,
}: {
  token: string;
  amountLabel: string;
  details: Details;
  onEdit: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/class/${token}/status`,
        // We already collected these — hand them to Stripe so the card step
        // doesn't ask again, and so the payment method carries the right contact.
        payment_method_data: {
          billing_details: {
            name: details.name,
            email: details.email,
            phone: details.phone,
          },
        },
      },
    });

    if (error) {
      setMessage(error.message ?? "Payment could not be completed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex items-start justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50/50 px-3 py-2.5">
        <div className="min-w-0 text-sm">
          <p className="font-medium text-ink">{details.name}</p>
          <p className="truncate text-xs text-muted">
            {details.email} · {details.phone}
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 text-sm font-medium text-brand-700 hover:underline"
        >
          Edit
        </button>
      </div>

      <PaymentElement
        options={{
          layout: "tabs",
          fields: { billingDetails: { name: "never", email: "never", phone: "never" } },
        }}
      />
      {message ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{message}</p>
      ) : null}
      <button type="submit" disabled={!stripe || loading} className="btn-primary">
        {loading ? "Processing…" : `Pay ${amountLabel}`}
      </button>
      <p className="text-center text-xs text-muted">
        Secured by Stripe — your card details never touch this site. A receipt is emailed to{" "}
        {details.email}. Full refund up to 48h before the class (
        <a
          href="/terms#refunds"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-brand-700 hover:underline"
        >
          refund policy
        </a>
        ).
      </p>
    </form>
  );
}

export function JoinAndPay({
  token,
  amountLabel,
  claimToken,
}: {
  token: string;
  amountLabel: string;
  claimToken?: string;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [details, setDetails] = useState<Details | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

  async function handleDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const next: Details = {
      name: String(fd.get("customerName") || "").trim(),
      email: String(fd.get("customerEmail") || "").trim(),
      phone: String(fd.get("customerPhone") || "").trim(),
    };

    try {
      const res = await fetch(`/api/join/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: next.name,
          customerEmail: next.email,
          customerPhone: next.phone,
          ...(claimToken ? { claimToken } : {}),
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { clientSecret?: string; error?: string }
        | null;
      if (!res.ok || !data?.clientSecret) {
        setError(data?.error || "Could not continue to payment.");
        setLoading(false);
        submittingRef.current = false;
        return;
      }
      setDetails(next);
      setClientSecret(data.clientSecret);
      setLoading(false);
      submittingRef.current = false;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      submittingRef.current = false;
    }
  }

  if (clientSecret && details) {
    return (
      <Elements stripe={getStripe()} options={{ clientSecret, appearance }}>
        <CheckoutForm
          token={token}
          amountLabel={amountLabel}
          details={details}
          onEdit={() => setClientSecret(null)}
        />
      </Elements>
    );
  }

  return (
    <form onSubmit={handleDetails} className="space-y-4">
      <div>
        <label htmlFor="customerName" className="label">
          Your name
        </label>
        <input
          id="customerName"
          name="customerName"
          className="input"
          defaultValue={details?.name}
          required
          autoFocus
        />
      </div>
      <div>
        <label htmlFor="customerEmail" className="label">
          Email
        </label>
        <input
          id="customerEmail"
          name="customerEmail"
          type="email"
          inputMode="email"
          autoComplete="email"
          className="input"
          placeholder="you@example.com"
          defaultValue={details?.email}
          required
        />
        <p className="hint">Your receipt and booking confirmation go here.</p>
      </div>
      <div>
        <label htmlFor="customerPhone" className="label">
          Phone
        </label>
        <input
          id="customerPhone"
          name="customerPhone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className="input"
          placeholder="07…"
          defaultValue={details?.phone}
          required
        />
      </div>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      ) : null}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Loading…" : "Continue to payment"}
      </button>
      <p className="text-center text-xs text-muted">
        We use your details to manage your booking and send your receipt. See our{" "}
        <a
          href="/privacy"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-brand-700 hover:underline"
        >
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}
