import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { ClassGrid } from "@/components/ClassGrid";
import { Stars } from "@/components/Stars";
import { getUpcomingClasses } from "@/lib/classes";
import { getReviews } from "@/lib/reviews";

export const dynamic = "force-dynamic";

// Placeholder copy — edit to Emily's real bio.
const ABOUT_TEXT =
  "Emily runs friendly, high-energy dance fitness classes for every level — no experience needed. Expect great music, a welcoming room, and a proper workout that never feels like one. Come and dance with us.";

export default async function Home() {
  const classes = await getUpcomingClasses(6);
  const themed = classes.filter((c) => c.themed);
  const standard = classes.filter((c) => !c.themed);
  const reviews = await getReviews(3);

  return (
    <div className="min-h-dvh">
      <PublicHeader />

      <main>
        <section className="brand-grad text-white">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-12 text-center sm:py-16">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
                <path d="M12 2l1.7 4.6L18 8.3l-4.3 1.7L12 14l-1.7-4L6 8.3l4.3-1.7z" />
              </svg>
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Move. Sweat. Smile.</h1>
            <p className="max-w-md text-base text-white/90 sm:text-lg">
              Friendly dance fitness classes with Emily — every level welcome.
            </p>
            <a
              href="#classes"
              className="rounded-xl bg-white px-6 py-3 text-base font-semibold text-brand-700 shadow-sm transition hover:bg-white/90"
            >
              See what’s on
            </a>
          </div>
        </section>

        <section id="classes" className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-2xl font-bold text-ink">Upcoming classes</h2>
          <p className="mt-1 text-muted">Pick a class to book — pay online and your spot’s confirmed instantly.</p>

          {classes.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-brand-100 bg-white p-8 text-center">
              <p className="font-semibold text-ink">New classes coming soon</p>
              <p className="mt-1 text-sm text-muted">
                Check back shortly — or follow along on social.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-8">
              {themed.length > 0 ? (
                <div>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                    Themed &amp; special
                  </h3>
                  <ClassGrid classes={themed} />
                </div>
              ) : null}
              {standard.length > 0 ? (
                <div>
                  {themed.length > 0 ? (
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Regular classes
                    </h3>
                  ) : null}
                  <ClassGrid classes={standard} />
                </div>
              ) : null}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/classes" className="text-sm font-semibold text-brand-700 hover:underline">
              View all classes →
            </Link>
          </div>
        </section>

        {reviews.length > 0 ? (
          <section className="mx-auto max-w-5xl px-4 py-14">
            <h2 className="text-2xl font-bold text-ink">What dancers say</h2>
            <div className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
              {reviews.map((r) => (
                <article key={r.id} className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
                  {r.rating ? <Stars rating={r.rating} /> : null}
                  <p className="mt-2 line-clamp-5 leading-relaxed text-ink">“{r.quote}”</p>
                  <p className="mt-3 text-sm font-semibold text-muted">— {r.name}</p>
                </article>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/reviews" className="text-sm font-semibold text-brand-700 hover:underline">
                Read all reviews →
              </Link>
            </div>
          </section>
        ) : null}

        <section id="about" className="bg-brand-50/60">
          <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-16 sm:grid-cols-2">
            <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-brand-100 bg-brand-100/60 text-sm text-muted">
              Photo of Emily
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ink">About Emily</h2>
              <p className="mt-3 leading-relaxed text-muted">{ABOUT_TEXT}</p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
