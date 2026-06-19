import Link from "next/link";
import { SITE_NAME } from "@/lib/config";
import { LogoutButton } from "./LogoutButton";
import { DiscoBall } from "@/components/DiscoBall";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-brand-100 bg-white/80 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3">
          <Link href="/admin" className="flex min-w-0 items-center gap-2 font-bold text-ink">
            <span className="brand-grad inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white">
              <DiscoBall size={22} id="db-admin" />
            </span>
            <span className="truncate">{SITE_NAME}</span>
          </Link>
          <nav className="flex shrink-0 items-center gap-3 text-sm">
            <Link href="/admin" className="text-muted hover:text-brand-700">
              Classes
            </Link>
            <Link href="/admin/reviews" className="text-muted hover:text-brand-700">
              Reviews
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="container-app py-6">{children}</main>
    </div>
  );
}
