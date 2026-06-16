"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteReviewButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!window.confirm("Delete this review?")) return;
    setLoading(true);
    const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setLoading(false);
      window.alert("Could not delete the review. Please try again.");
      return;
    }
    router.refresh();
  }

  return (
    <button
      onClick={onDelete}
      disabled={loading}
      aria-label="Delete review"
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
    >
      ✕
    </button>
  );
}
