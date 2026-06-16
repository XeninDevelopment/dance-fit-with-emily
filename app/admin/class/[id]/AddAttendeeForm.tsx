"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function AddAttendeeForm({ classId }: { classId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const submittingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      customerName: String(fd.get("customerName") || ""),
      customerEmail: String(fd.get("customerEmail") || ""),
      customerPhone: String(fd.get("customerPhone") || ""),
    };

    try {
      const res = await fetch(`/api/classes/${classId}/attendees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(data?.error || "Could not add attendee");
        setLoading(false);
        submittingRef.current = false;
        return;
      }
      formRef.current?.reset();
      setLoading(false);
      submittingRef.current = false;
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      submittingRef.current = false;
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-3">
      <input name="customerName" className="input" placeholder="Name" required />
      <input
        name="customerEmail"
        type="email"
        inputMode="email"
        className="input"
        placeholder="Email"
        required
      />
      <input
        name="customerPhone"
        type="tel"
        inputMode="tel"
        className="input"
        placeholder="Phone (optional)"
      />
      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      ) : null}
      <button type="submit" className="btn-secondary" disabled={loading}>
        {loading ? "Adding…" : "Add paid attendee"}
      </button>
    </form>
  );
}
