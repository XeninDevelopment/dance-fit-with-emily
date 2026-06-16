"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function AddReviewForm() {
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
      name: String(fd.get("name") || ""),
      title: String(fd.get("title") || ""),
      quote: String(fd.get("quote") || ""),
      rating: String(fd.get("rating") || ""),
      featured: fd.get("featured") === "on",
    };

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(data?.error || "Could not add review");
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
      <input name="name" className="input" placeholder="Name" required />
      <input name="title" className="input" placeholder="Headline (optional, e.g. for a case study)" />
      <textarea name="quote" className="input min-h-24" placeholder="What they said" required />
      <div className="grid grid-cols-2 gap-3">
        <select name="rating" className="input" defaultValue="">
          <option value="">No rating</option>
          <option value="5">★★★★★</option>
          <option value="4">★★★★</option>
          <option value="3">★★★</option>
          <option value="2">★★</option>
          <option value="1">★</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" name="featured" className="h-5 w-5 rounded border-brand-300 text-brand-600" />
          Case study
        </label>
      </div>
      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      ) : null}
      <button type="submit" className="btn-secondary" disabled={loading}>
        {loading ? "Adding…" : "Add review"}
      </button>
    </form>
  );
}
