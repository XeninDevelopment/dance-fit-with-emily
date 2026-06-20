"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type { GalleryPhoto } from "@/lib/gallery";

export function GalleryGrid({ photos }: { photos: GalleryPhoto[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;

  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)),
    [photos.length],
  );
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, prev, next]);

  const current = index !== null ? photos[index] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            onClick={() => setIndex(i)}
            aria-label={`View photo: ${photo.alt}`}
            className="group relative aspect-square overflow-hidden rounded-xl border border-brand-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 640px) 33vw, 50vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {current ? (
        <div
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4"
        >
          <button
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
          >
            ✕
          </button>

          {photos.length > 1 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20 sm:left-4"
            >
              ‹
            </button>
          ) : null}

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative h-[78vh] w-[92vw] max-w-4xl"
          >
            <Image
              src={current.src}
              alt={current.alt}
              fill
              sizes="92vw"
              className="object-contain"
              priority
            />
          </div>

          {current.alt ? (
            <p className="mt-3 max-w-2xl text-center text-sm text-white/80">{current.alt}</p>
          ) : null}

          {photos.length > 1 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20 sm:right-4"
            >
              ›
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
