"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const CURRENCIES = [
  { code: "gbp", label: "£ GBP" },
  { code: "usd", label: "$ USD" },
  { code: "eur", label: "€ EUR" },
];

export function NewClassForm({ defaultCurrency = "gbp" }: { defaultCurrency?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);
  const minDateTime = useMemo(() => new Date().toISOString().slice(0, 16), []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      danceType: String(fd.get("danceType") || ""),
      classDateTime: String(fd.get("classDateTime") || ""),
      location: String(fd.get("location") || ""),
      amountMajor: String(fd.get("amountMajor") || ""),
      currency: String(fd.get("currency") || defaultCurrency),
      capacity: String(fd.get("capacity") || ""),
      themed: fd.get("themed") === "on",
    };

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as
        | { id?: string; error?: string }
        | null;
      if (!res.ok || !data?.id) {
        setError(data?.error || "Could not create class");
        setLoading(false);
        submittingRef.current = false;
        return;
      }
      router.replace(`/admin/class/${data.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      submittingRef.current = false;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="danceType" className="label">
          Class name / dance type
        </label>
        <input
          id="danceType"
          name="danceType"
          className="input"
          placeholder="e.g. Saturday Salsa, Ballet beginners"
          required
          autoFocus
        />
      </div>

      <div>
        <label htmlFor="classDateTime" className="label">
          Date &amp; time
        </label>
        <input
          id="classDateTime"
          name="classDateTime"
          type="datetime-local"
          min={minDateTime}
          className="input"
          required
        />
      </div>

      <div>
        <label htmlFor="location" className="label">
          Location <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="location"
          name="location"
          className="input"
          placeholder="e.g. Studio 2, Town Hall"
        />
      </div>

      <div>
        <label htmlFor="spotifyUrl" className="label">
          Spotify playlist <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="spotifyUrl"
          name="spotifyUrl"
          type="url"
          inputMode="url"
          className="input"
          placeholder="https://open.spotify.com/playlist/…"
        />
        <p className="hint">Public playlist link — previewed on the join page. You can add this later too.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label htmlFor="amountMajor" className="label">
            Price per person
          </label>
          <input
            id="amountMajor"
            name="amountMajor"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.5"
            className="input"
            placeholder="12.50"
            required
          />
        </div>
        <div>
          <label htmlFor="currency" className="label">
            Currency
          </label>
          <select id="currency" name="currency" defaultValue={defaultCurrency} className="input">
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="capacity" className="label">
          Capacity <span className="font-normal text-muted">(optional — blank = unlimited)</span>
        </label>
        <input
          id="capacity"
          name="capacity"
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          className="input"
          placeholder="e.g. 12"
        />
      </div>

      <label className="flex items-center gap-3 py-1">
        <input
          type="checkbox"
          name="themed"
          className="h-5 w-5 rounded border-brand-300 text-brand-600"
        />
        <span className="text-sm text-ink">
          Themed / special class{" "}
          <span className="font-normal text-muted">(shown separately from regular classes)</span>
        </span>
      </label>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      ) : null}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Creating class…" : "Create class & get join link"}
      </button>
    </form>
  );
}
