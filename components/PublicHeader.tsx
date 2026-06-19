"use client";

import Link from "next/link";
import { useState } from "react";
import { SITE_NAME } from "@/lib/config";
import { DiscoBall } from "@/components/DiscoBall";

const NAV = [
  { href: "/classes", label: "Classes" },
  { href: "/reviews", label: "Reviews" },
  { href: "/faq", label: "FAQ" },
  { href: "/#about", label: "About" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex min-w-0 items-center gap-2 font-bold text-ink"
        >
          <span className="brand-grad inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white">
            <DiscoBall size={22} id="db-header" />
          </span>
          <span className="truncate">{SITE_NAME}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 text-sm sm:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-muted hover:text-brand-700">
              {n.label}
            </Link>
          ))}
          <Link href="/classes" className="btn-primary !w-auto px-4 py-2 text-sm">
            Book a class
          </Link>
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 sm:hidden">
          <Link
            href="/classes"
            onClick={() => setOpen(false)}
            className="btn-primary !w-auto px-4 py-2 text-sm"
          >
            Book
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink hover:bg-brand-50"
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
      </div>

      {/* Mobile dropdown panel */}
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
        </nav>
      ) : null}

      <div className="brand-grad h-1 w-full" aria-hidden="true" />
    </header>
  );
}
