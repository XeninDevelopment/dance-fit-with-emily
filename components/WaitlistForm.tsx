"use client";

import { useRef, useState } from "react";

// Shown on a full class: join the waitlist to get first access when a spot frees up.
export function WaitlistForm({ token }: { token: string }) {
  const submittingRef = useRef(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<"joined" | "already" | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/waitlist/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, website }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; already?: boolean; error?: string }
        | null;
      if (!res.ok) {
        setError(data?.error || "Could not join the waitlist. Please try again.");
        setLoading(false);
        submittingRef.current = false;
        return;
      }
      setDone(data?.already ? "already" : "joined");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      submittingRef.current = false;
    }
  }

  if (done) {
    return (
      <div role="status" className="mt-4 rounded-xl border border-brand-100 bg-brand-50/50 p-4 text-center">
        <p className="font-semibold text-ink">
          {done === "already" ? "You’re already on the list! 💖" : "You’re on the waitlist! 💖"}
        </p>
        <p className="mt-1 text-sm text-muted">
          If a spot frees up, we’ll email you a private link — first in line gets first access.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3 text-left">
      <p className="text-center text-sm font-semibold text-ink">
        Want in if someone drops out? Join the waitlist:
      </p>
      <div>
        <label htmlFor="wl-name" className="label">
          Your name
        </label>
        <input
          id="wl-name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          required
        />
      </div>
      <div>
        <label htmlFor="wl-email" className="label">
          Email
        </label>
        <input
          id="wl-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={200}
          placeholder="you@example.com"
          required
        />
        <p className="hint">We’ll email you here if a spot opens up.</p>
      </div>

      {/* Honeypot: hidden from people, tempting to bots. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        aria-hidden="true"
      />

      {error ? (
        <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Joining…" : "Join the waitlist"}
      </button>
    </form>
  );
}
