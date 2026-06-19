import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { ReviewsShowcase } from "@/components/ReviewsShowcase";
import { LeaveReviewForm } from "@/components/LeaveReviewForm";
import { getReviews } from "@/lib/reviews";
import { SITE_NAME } from "@/lib/config";

export const dynamic = "force-dynamic";

const DESC = "Reviews and case studies from Emily's dance fitness classes.";
export const metadata: Metadata = {
  title: "Reviews",
  description: DESC,
  openGraph: { title: `Reviews · ${SITE_NAME}`, description: DESC },
};

export default async function ReviewsPage() {
  const reviews = await getReviews();

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
          <div className="mt-8">
            <ReviewsShowcase reviews={reviews} />
          </div>
        )}

        <section className="mt-16 rounded-2xl border border-brand-100 bg-brand-50/50 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-ink">Leave a review</h2>
          <p className="mt-1 text-muted">
            Been to a class? We’d love to hear how it went — your words help other dancers take the
            first step.
          </p>
          <div className="mt-6 max-w-xl">
            <LeaveReviewForm />
          </div>
        </section>

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
