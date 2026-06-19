import Link from "next/link";
import { SITE_NAME, CONTACT, SERVICE_AREA } from "@/lib/config";

export function PublicFooter() {
  return (
    <footer className="mt-16 border-t border-brand-100 bg-white/60">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-10 text-center">
        <p className="font-semibold text-ink">{SITE_NAME}</p>
        <p className="text-sm text-muted">Dance fitness classes for every level.</p>
        <nav className="flex flex-wrap justify-center gap-4 text-sm text-muted">
          <Link href="/classes" className="hover:text-brand-700">Classes</Link>
          <Link href="/reviews" className="hover:text-brand-700">Reviews</Link>
          <Link href="/faq" className="hover:text-brand-700">FAQ</Link>
          <Link href="/gallery" className="hover:text-brand-700">Gallery</Link>
        </nav>
        <div className="flex gap-5 text-sm text-muted">
          <a href={CONTACT.instagram} target="_blank" rel="noreferrer" className="hover:text-brand-700">
            Instagram
          </a>
          <a href={CONTACT.tiktok} target="_blank" rel="noreferrer" className="hover:text-brand-700">
            TikTok
          </a>
          <a href={`mailto:${CONTACT.email}`} className="hover:text-brand-700">
            Email
          </a>
        </div>

        {/* Legal links (Privacy/Terms) are added back when those pages are committed. */}
        <p className="mt-2 text-xs text-muted/70">
          {SITE_NAME} · dance fitness classes in {SERVICE_AREA}.
        </p>

        <Link href="/admin" className="mt-2 text-xs text-muted/70 hover:text-brand-700">
          Studio admin
        </Link>
      </div>
    </footer>
  );
}
