import { AdminShell } from "@/components/AdminShell";
import { Stars } from "@/components/Stars";
import { AddReviewForm } from "./AddReviewForm";
import { DeleteReviewButton } from "./DeleteReviewButton";
import { getReviews } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await getReviews();

  return (
    <AdminShell>
      <h2 className="text-lg font-bold text-ink">Reviews</h2>
      <p className="text-sm text-muted">
        These appear on your public reviews page. Tick “case study” to feature a longer story.
      </p>

      <div className="card mt-4">
        <h3 className="font-semibold text-ink">Add a review</h3>
        <p className="mb-3 mt-0.5 text-sm text-muted">A headline is optional — great for case studies.</p>
        <AddReviewForm />
      </div>

      <div className="mt-6 space-y-3">
        {reviews.length === 0 ? (
          <div className="card text-center">
            <p className="text-sm text-muted">No reviews yet. Add your first one above.</p>
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="card flex items-start justify-between gap-3">
              <div className="min-w-0">
                {r.featured ? <span className="badge-processing">Case study</span> : null}
                {r.title ? <p className="mt-1 font-semibold text-ink">{r.title}</p> : null}
                {r.rating ? (
                  <div className="mt-1">
                    <Stars rating={r.rating} />
                  </div>
                ) : null}
                <p className="mt-1 text-sm text-ink">“{r.quote}”</p>
                <p className="mt-1 text-xs text-muted">— {r.name}</p>
              </div>
              <DeleteReviewButton id={r.id} />
            </div>
          ))
        )}
      </div>
    </AdminShell>
  );
}
