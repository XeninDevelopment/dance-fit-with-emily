import type { Metadata } from "next";
import Image from "next/image";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { GALLERY } from "@/lib/gallery";
import { SITE_NAME } from "@/lib/config";

const DESC = "Photos from Emily's dance fitness classes and events.";
export const metadata: Metadata = {
  title: "Gallery",
  description: DESC,
  openGraph: { title: `Gallery · ${SITE_NAME}`, description: DESC },
};

export default function GalleryPage() {
  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-ink">From the dance floor</h1>
        <p className="mt-1 text-muted">A few snaps from classes and events.</p>

        {GALLERY.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-10 text-center">
            <p className="font-semibold text-ink">Photos coming soon</p>
            <p className="mt-1 text-sm text-muted">Check back shortly for snaps from class.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {GALLERY.map((photo) => (
              <div
                key={photo.src}
                className="relative aspect-square overflow-hidden rounded-xl border border-brand-100"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 640px) 33vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
