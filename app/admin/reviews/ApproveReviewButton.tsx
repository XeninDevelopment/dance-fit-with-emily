"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ApproveReviewButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onApprove() {
    setLoading(true);
    const res = await fetch(`/api/reviews/${id}`, { method: "PATCH" });
    if (!res.ok) {
      setLoading(false);
      window.alert("Could not approve the review. Please try again.");
      return;
    }
    router.refresh();
  }

  return (
    <button
      onClick={onApprove}
      disabled={loading}
      className="btn-secondary !w-auto px-4 py-2 text-sm"
    >
      {loading ? "Approving…" : "Approve"}
    </button>
  );
}
