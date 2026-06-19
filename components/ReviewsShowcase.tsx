"use client";

import { useEffect, useState } from "react";
import { Stars } from "@/components/Stars";

type Review = {
  id: string;
  name: string;
  title: string | null;
  quote: string;
  rating: number | null;
  featured: boolean;
};

export function ReviewsShowcase({ reviews }: { reviews: Review[] }) {
  const [selected, setSelected] = useState<Review | null>(null);

  useEffect(() => {
    if (!selected) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selected]);

  return (
    <>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
        {reviews.map((r) => {
          const long = r.quote.length > 180;
          return (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className="flex h-72 flex-col rounded-2xl border border-brand-100 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-md"
            >
              {r.featured ? (
                <span className="mb-2 inline-flex w-fit items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                  Case study
                </span>
              ) : null}
              {r.rating ? <Stars rating={r.rating} /> : null}
              <p className="mt-2 line-clamp-5 leading-relaxed text-ink">“{r.quote}”</p>
              <div className="mt-auto pt-3">
                <p className="truncate text-sm font-semibold text-muted">
                  — {r.name}
                  {r.title && !r.featured ? `, ${r.title}` : ""}
                </p>
                {long ? (
                  <span className="text-sm font-semibold text-brand-700">Read review →</span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {selected ? (
        <div
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Review"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>{selected.rating ? <Stars rating={selected.rating} /> : null}</div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-brand-50"
              >
                ✕
              </button>
            </div>
            {selected.featured ? (
              <span className="mt-2 inline-flex w-fit items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                Case study
              </span>
            ) : null}
            {selected.title ? (
              <h3 className="mt-2 text-lg font-bold text-ink">{selected.title}</h3>
            ) : null}
            <p className="mt-2 whitespace-pre-line leading-relaxed text-ink">“{selected.quote}”</p>
            <p className="mt-4 text-sm font-semibold text-brand-700">— {selected.name}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
