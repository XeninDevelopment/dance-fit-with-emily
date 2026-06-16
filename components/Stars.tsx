export function Stars({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`h-4 w-4 ${i < rating ? "text-amber-400" : "text-brand-100"}`}
          aria-hidden="true"
        >
          <path d="M12 2l2.9 6 6.6.6-5 4.3 1.5 6.5L12 16.9 6 19.4l1.5-6.5-5-4.3 6.6-.6z" />
        </svg>
      ))}
    </div>
  );
}
