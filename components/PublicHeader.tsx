import Link from "next/link";
import { SITE_NAME } from "@/lib/config";

function Sparkle() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M12 2l1.7 4.6L18 8.3l-4.3 1.7L12 14l-1.7-4L6 8.3l4.3-1.7z" />
    </svg>
  );
}

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-brand-100 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2 font-bold text-ink">
          <span className="brand-grad inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white">
            <Sparkle />
          </span>
          <span className="truncate">{SITE_NAME}</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/classes" className="hidden text-muted hover:text-brand-700 sm:inline">
            Classes
          </Link>
          <Link href="/reviews" className="hidden text-muted hover:text-brand-700 sm:inline">
            Reviews
          </Link>
          <Link href="/#about" className="hidden text-muted hover:text-brand-700 sm:inline">
            About
          </Link>
          <Link href="/classes" className="btn-primary !w-auto px-4 py-2 text-sm">
            Book a class
          </Link>
        </nav>
      </div>
    </header>
  );
}
