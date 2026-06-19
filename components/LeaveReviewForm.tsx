"use client";

import { useEffect, useRef, useState } from "react";

// Public "leave a review" form: name, an interactive star rating, and a comment.
// Submissions go to /api/review-submissions and are held for admin approval, so a
// success message makes clear the review won't appear instantly.
export function LeaveReviewForm() {
  const submittingRef = useRef(false);
  const firstStarRef = useRef<HTMLButtonElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [website, setWebsite] = useState(""); // honeypot
  const [error, setError] = useState<string | null>(null);
  const [ratingError, setRatingError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Move focus to the confirmation so keyboard / screen-reader users aren't dropped
  // to <body> when the form unmounts.
  useEffect(() => {
    if (done) successRef.current?.focus();
  }, [done]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return;
    setError(null);
    setRatingError(false);
    if (rating < 1) {
      setRatingError(true);
      setError("Please choose a star rating.");
      firstStarRef.current?.focus();
      return;
    }
    submittingRef.current = true;
    setLoading(true);

    try {
      const res = await fetch("/api/review-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating, comment, website }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(data?.error || "Could not submit your review. Please try again.");
        setLoading(false);
        submittingRef.current = false;
        return;
      }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      submittingRef.current = false;
    }
  }

  if (done) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-2xl border border-brand-100 bg-white p-6 text-center shadow-sm focus:outline-none"
      >
        <p className="text-lg font-semibold text-ink">Thank you! 💖</p>
        <p className="mt-1 text-sm text-muted">
          Your review has been sent to Emily and will appear here once it’s approved.
        </p>
      </div>
    );
  }

  const shown = hover || rating;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="lr-name" className="label">
          Your name
        </label>
        <input
          id="lr-name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          placeholder="e.g. Sarah J."
          required
        />
      </div>

      <div>
        <span id="lr-rating-label" className="label">
          Your rating
        </span>
        <div
          className="flex items-center gap-1"
          role="group"
          aria-labelledby="lr-rating-label"
          aria-invalid={ratingError || undefined}
          aria-describedby={ratingError ? "lr-error" : undefined}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              ref={n === 1 ? firstStarRef : undefined}
              type="button"
              aria-pressed={rating === n}
              aria-label={`Rate ${n} star${n > 1 ? "s" : ""} out of 5`}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(0)}
              onClick={() => {
                setRating(n);
                setRatingError(false);
              }}
              className="rounded p-0.5 transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className={`h-9 w-9 ${n <= shown ? "text-amber-400" : "text-brand-100"}`}
                aria-hidden="true"
              >
                <path d="M12 2l2.9 6 6.6.6-5 4.3 1.5 6.5L12 16.9 6 19.4l1.5-6.5-5-4.3 6.6-.6z" />
              </svg>
            </button>
          ))}
          {/* Persistent committed value, independent of hover/focus preview. */}
          <span className="ml-2 text-sm font-semibold text-ink" aria-hidden="true">
            {rating > 0 ? `${rating}/5` : ""}
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="lr-comment" className="label">
          Your review
        </label>
        <textarea
          id="lr-comment"
          className="input min-h-28"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1500}
          placeholder="Tell others what your class was like…"
          required
        />
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
        <p id="lr-error" role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary !w-auto px-6" disabled={loading}>
          {loading ? "Submitting…" : "Submit review"}
        </button>
        <p className="text-xs text-muted">Reviews are checked before they appear on the site.</p>
      </div>
    </form>
  );
}
