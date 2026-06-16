"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteClassButton({ id, hasPaid }: { id: string; hasPaid: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    const message = hasPaid
      ? "This class has PAID attendees. Deleting removes the class and everyone on it — no refunds are issued. Delete anyway?"
      : "Delete this class and its join link?";
    if (!window.confirm(message)) return;

    setLoading(true);
    const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setLoading(false);
      window.alert("Could not delete the class. Please try again.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <button onClick={onDelete} disabled={loading} className="btn-danger">
      {loading ? "Deleting…" : "Delete class"}
    </button>
  );
}
