"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RefundAttendeeButton({ id, amountLabel }: { id: string; amountLabel: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onRefund() {
    if (!window.confirm(`Refund ${amountLabel} and cancel this place? The spot will free up.`)) {
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/bookings/${id}/refund`, { method: "POST" });
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    if (!res.ok) {
      setLoading(false);
      window.alert(data?.error || "Could not refund. Please try again.");
      return;
    }
    router.refresh();
  }

  return (
    <button
      onClick={onRefund}
      disabled={loading}
      className="inline-flex min-h-9 items-center rounded-lg border border-rose-200 px-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
    >
      {loading ? "…" : "Refund"}
    </button>
  );
}
