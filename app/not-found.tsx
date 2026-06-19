import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export default function NotFound() {
  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <main className="mx-auto flex max-w-5xl flex-col items-center px-4 py-24 text-center">
        <p className="text-5xl font-bold text-brand-600">404</p>
        <h1 className="mt-3 text-2xl font-bold text-ink">Page not found</h1>
        <p className="mt-2 max-w-md text-muted">
          Sorry, the page you’re looking for doesn’t exist or has moved.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary !w-auto px-5">
            Go home
          </Link>
          <Link href="/classes" className="btn-secondary !w-auto px-5">
            Browse classes
          </Link>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
