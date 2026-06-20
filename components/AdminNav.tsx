"use client";

import Link from "next/link";
import { useState } from "react";
import { SITE_NAME } from "@/lib/config";
import { DiscoBall } from "@/components/DiscoBall";
import { LogoutButton } from "@/components/LogoutButton";

const NAV = [
  { href: "/admin", label: "Classes" },
  { href: "/admin/reviews", label: "Reviews" },
];

export function AdminNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-brand-100 bg-white/80 backdrop-blur">
      <div className="container-app flex items-center justify-between py-3">
        <Link
          href="/admin"
          onClick={() => setOpen(false)}
          className="flex min-w-0 items-center gap-2 font-bold text-ink"
        >
          <span className="brand-grad inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white">
            <DiscoBall size={22} id="db-admin" />
          </span>
          <span className="truncate">{SITE_NAME}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden shrink-0 items-center gap-3 text-sm sm:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-muted hover:text-brand-700">
              {n.label}
            </Link>
          ))}
          <LogoutButton />
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink hover:bg-brand-50 sm:hidden"
        >
          {open ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-6 w-6" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-6 w-6" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown panel — includes Sign out */}
      {open ? (
        <nav className="border-t border-brand-100 bg-white px-4 py-1 sm:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-base font-medium text-ink hover:text-brand-700"
            >
              {n.label}
            </Link>
          ))}
          <LogoutButton className="block w-full border-t border-brand-100 py-3 text-left text-base font-medium text-ink hover:text-brand-700 disabled:opacity-50" />
        </nav>
      ) : null}
    </header>
  );
}
