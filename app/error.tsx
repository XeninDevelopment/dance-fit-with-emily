"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-ink">Something went wrong</h1>
      <p className="mt-2 max-w-md text-muted">
        Sorry about that — please try again in a moment.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn-primary !w-auto px-5">
          Try again
        </button>
        <Link href="/" className="btn-secondary !w-auto px-5">
          Go home
        </Link>
      </div>
    </main>
  );
}
