import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { formatDateTime } from "@/lib/datetime";
import type { PublicClass } from "@/lib/classes";

function CalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="h-4 w-4 shrink-0 text-brand-500"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18M8 2v4M16 2v4" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-brand-500"
      aria-hidden="true"
    >
      <path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function ClassCard({ cls }: { cls: PublicClass }) {
  return (
    <div className="flex flex-col rounded-2xl border border-brand-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
      {cls.themed ? (
        <span className="mb-2 inline-flex w-fit items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
          Themed
        </span>
      ) : null}
      <p className="text-base font-semibold text-ink">{cls.danceType}</p>

      <div className="mt-2 space-y-1.5 text-sm text-muted">
        <p className="flex items-center gap-2">
          <CalIcon />
          {formatDateTime(cls.classDateTime)}
        </p>
        {cls.location ? (
          <p className="flex items-center gap-2">
            <PinIcon />
            {cls.location}
          </p>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xl font-bold text-ink">{formatMoney(cls.amount, cls.currency)}</span>
        {cls.spotsLeft != null ? (
          <span
            className={
              cls.full
                ? "badge-failed"
                : cls.spotsLeft <= 3
                  ? "badge-pending"
                  : "badge-paid"
            }
          >
            {cls.full
              ? "Full"
              : `${cls.spotsLeft} ${cls.spotsLeft === 1 ? "spot" : "spots"} left`}
          </span>
        ) : null}
      </div>

      {cls.full ? (
        <span className="btn-secondary mt-4 cursor-not-allowed opacity-60">Fully booked</span>
      ) : (
        <Link href={`/class/${cls.token}`} className="btn-primary mt-4">
          View &amp; book
        </Link>
      )}
    </div>
  );
}
