"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="-mx-2 inline-flex min-h-11 items-center px-2 text-sm font-medium text-muted transition hover:text-brand-700 disabled:opacity-50"
    >
      {loading ? "…" : "Sign out"}
    </button>
  );
}
