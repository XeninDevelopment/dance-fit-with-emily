import { AdminShell } from "@/components/AdminShell";
import { Stars } from "@/components/Stars";
import { AddReviewForm } from "./AddReviewForm";
import { DeleteReviewButton } from "./DeleteReviewButton";
import { ApproveReviewButton } from "./ApproveReviewButton";
import { getReviews, getPendingReviews } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const [reviews, pending] = await Promise.all([getReviews(), getPendingReviews()]);

  return (
    <AdminShell>
      <h2 className="text-lg font-bold text-ink">Reviews</h2>
      <p className="text-sm text-muted">
        These appear on your public reviews page. Tick “case study” to feature a longer story.
      </p>

      {pending.length > 0 ? (
        <div className="mt-4">
          <h3 className="flex items-center gap-2 font-semibold text-ink">
            Awaiting approval <span className="badge-pending">{pending.length}</span>
          </h3>
          <p className="text-sm text-muted">
            Submitted by visitors. Approve to publish, or delete to discard.
          </p>
          <div className="mt-3 space-y-3">
            {pending.map((r) => (
              <div key={r.id} className="card border-amber-200 bg-amber-50/40">
                {r.rating ? (
                  <div>
                    <Stars rating={r.rating} />
                  </div>
                ) : null}
                <p className="mt-1 text-sm text-ink">“{r.quote}”</p>
                <p className="mt-1 text-xs text-muted">— {r.name}</p>
                <div className="mt-3 flex items-center gap-2">
                  <ApproveReviewButton id={r.id} />
                  <DeleteReviewButton id={r.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

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
