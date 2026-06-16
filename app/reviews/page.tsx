import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { Stars } from "@/components/Stars";
import { getReviews } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await getReviews();
  const featured = reviews.filter((r) => r.featured);
  const others = reviews.filter((r) => !r.featured);

  return (
    <div className="min-h-dvh">
      <PublicHeader />

      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-ink">What our dancers say</h1>
        <p className="mt-1 text-muted">Real stories and reviews from Emily’s classes.</p>

        {reviews.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-10 text-center">
            <p className="font-semibold text-ink">No reviews yet</p>
            <p className="mt-1 text-sm text-muted">Check back soon — or come dance and be the first.</p>
          </div>
        ) : (
          <>
            {featured.length > 0 ? (
              <section className="mt-8 space-y-4">
                {featured.map((r) => (
                  <article
                    key={r.id}
                    className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm sm:p-8"
                  >
                    {r.rating ? <Stars rating={r.rating} /> : null}
                    {r.title ? (
                      <h2 className="mt-2 text-xl font-bold text-ink">{r.title}</h2>
                    ) : null}
                    <p className="mt-2 text-lg leading-relaxed text-ink">“{r.quote}”</p>
                    <p className="mt-3 font-semibold text-brand-700">— {r.name}</p>
                  </article>
                ))}
              </section>
            ) : null}

            {others.length > 0 ? (
              <section className="mt-8 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
                {others.map((r) => (
                  <article
                    key={r.id}
                    className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm"
                  >
                    {r.rating ? <Stars rating={r.rating} /> : null}
                    <p className="mt-2 leading-relaxed text-ink">“{r.quote}”</p>
                    <p className="mt-3 text-sm font-semibold text-muted">
                      — {r.name}
                      {r.title ? `, ${r.title}` : ""}
                    </p>
                  </article>
                ))}
              </section>
            ) : null}
          </>
        )}

        <div className="mt-12 text-center">
          <Link href="/classes" className="btn-primary !w-auto px-6">
            Browse classes
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
