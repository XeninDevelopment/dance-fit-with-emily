import Link from "next/link";
import { SITE_NAME } from "@/lib/config";

export function PublicFooter() {
  return (
    <footer className="mt-16 border-t border-brand-100 bg-white/60">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-10 text-center">
        <p className="font-semibold text-ink">{SITE_NAME}</p>
        <p className="text-sm text-muted">Dance fitness classes for every level.</p>
        <div className="flex gap-5 text-sm text-muted">
          <a href="#" className="hover:text-brand-700">Instagram</a>
          <a href="#" className="hover:text-brand-700">Facebook</a>
          <a href="#" className="hover:text-brand-700">Email</a>
        </div>
        <Link href="/admin" className="mt-2 text-xs text-muted/70 hover:text-brand-700">
          Studio admin
        </Link>
      </div>
    </footer>
  );
}
