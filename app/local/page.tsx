import type { Metadata } from "next";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { LOCAL_BUSINESSES } from "@/lib/localBusinesses";
import { SITE_NAME } from "@/lib/config";

const DESC =
  "Local businesses Emily knows, uses and loves — beauty, music, wellness and bakes across the North West.";
export const metadata: Metadata = {
  title: "Local businesses we love",
  description: DESC,
  openGraph: { title: `Local businesses we love · ${SITE_NAME}`, description: DESC },
};

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function LocalBusinessesPage() {
  return (
    <div className="min-h-dvh">
      <PublicHeader />

      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Local businesses we love</h1>
        <p className="mt-1 text-muted">
          A few wonderful local businesses Emily uses and trusts. Go and show them some love 💖
        </p>

        <div className="mt-8 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          {LOCAL_BUSINESSES.map((b) => (
            <a
              key={b.instagram}
              href={`https://www.instagram.com/${b.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col rounded-2xl border border-brand-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="brand-grad flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl">
                  <span aria-hidden="true">{b.emoji}</span>
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold text-ink">{b.name}</p>
                  <p className="truncate text-sm text-muted">
                    {b.category} · {b.location}
                  </p>
                </div>
              </div>

              <p className="mt-3 flex-1 leading-relaxed text-ink">“{b.blurb}”</p>

              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                <InstagramIcon />
                @{b.instagram}
                <span className="transition group-hover:translate-x-0.5">→</span>
              </span>
            </a>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted">
          Run a brilliant local business? Let Emily know — she loves to support the community.
        </p>
      </main>

      <PublicFooter />
    </div>
  );
}
