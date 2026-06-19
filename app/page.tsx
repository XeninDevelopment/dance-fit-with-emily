import Link from "next/link";
import Image from "next/image";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { ClassGrid } from "@/components/ClassGrid";
import { Stars } from "@/components/Stars";
import { getUpcomingClasses } from "@/lib/classes";
import { getReviews } from "@/lib/reviews";
import { GALLERY } from "@/lib/gallery";
import { DiscoBall } from "@/components/DiscoBall";

export const dynamic = "force-dynamic";

const ABOUT_PARAGRAPHS = [
  "Hi! It's great to virtually meet you! I'm Emily and I'm a dance fitness instructor based in the North West. Since I was a little girl, I have always been in love with musical theatre and all things performance. I started as a gymnast and cheerleader when I was just four years old, however, my personal dance journey only began when I was sixteen! I started learning choreography from music videos, musicals, and even recorded concerts in my kitchen, alongside attending dance style classes in the gym.",
  "It was then I realised just how much joy I could spread by sharing my love of dance with so many others. Furthermore, when I got to college, I was entrusted with choreographing five, full-scale musical productions, and I started teaching my very own dance fitness classes. Four years down the line, I have had the opportunity to teach abroad, and through my classes have met the most incredible people who have also found, enhanced, and empowered their love of dance!",
];

function SparkleDot({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2l1.7 4.6L18 8.3l-4.3 1.7L12 14l-1.7-4L6 8.3l4.3-1.7z" />
    </svg>
  );
}

// Scattered hero sparkles. Positions are kept out of the central text column
// (roughly 32%–68% wide) so the headline stays clean. Class strings are written
// in full so Tailwind's scanner picks them up.
const HERO_SPARKLES = [
  { pos: "left-[7%] top-[20%]", size: "h-4 w-4", tone: "text-white/60", delay: "0s" },
  { pos: "left-[15%] top-[58%]", size: "h-3 w-3", tone: "text-white/40", delay: "0.5s" },
  { pos: "left-[11%] bottom-[16%]", size: "h-5 w-5", tone: "text-white/55", delay: "1.6s" },
  { pos: "left-[24%] top-[32%]", size: "h-3 w-3", tone: "text-white/35", delay: "2.4s" },
  { pos: "left-[27%] bottom-[30%]", size: "h-4 w-4", tone: "text-white/45", delay: "1.1s" },
  { pos: "left-[44%] top-[9%]", size: "h-3 w-3", tone: "text-white/40", delay: "2.0s" },
  { pos: "right-[9%] top-[26%]", size: "h-5 w-5", tone: "text-white/55", delay: "0.9s" },
  { pos: "right-[17%] top-[62%]", size: "h-3 w-3", tone: "text-white/40", delay: "1.9s" },
  { pos: "right-[11%] bottom-[20%]", size: "h-4 w-4", tone: "text-white/50", delay: "2.2s" },
  { pos: "right-[25%] top-[42%]", size: "h-3 w-3", tone: "text-white/30", delay: "0.3s" },
  { pos: "right-[27%] bottom-[32%]", size: "h-5 w-5", tone: "text-white/45", delay: "1.4s" },
  { pos: "right-[42%] bottom-[11%]", size: "h-3 w-3", tone: "text-white/35", delay: "0.7s" },
];

export default async function Home() {
  const classes = await getUpcomingClasses(6);
  const themed = classes.filter((c) => c.themed);
  const standard = classes.filter((c) => !c.themed);
  const reviews = await getReviews(3);

  return (
    <div className="min-h-dvh">
      <PublicHeader />

      <main>
        <section className="brand-grad relative overflow-hidden text-white">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {HERO_SPARKLES.map((s, i) => (
              <span
                key={i}
                className={`disco-twinkle absolute ${s.pos} ${s.tone}`}
                style={{ animationDelay: s.delay }}
              >
                <SparkleDot className={s.size} />
              </span>
            ))}
          </div>

          <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-12 text-center sm:py-16">
            <DiscoBall size={80} id="db-hero" animated />
            <h1 className="reveal-up d1 text-4xl font-bold tracking-tight sm:text-5xl">
              Come dance with us
            </h1>
            <p className="reveal-up d2 max-w-xl text-base text-white/90 sm:text-lg">
              Feel-good dance fitness classes with Emily — find, enhance and empower your love
              of dance.
            </p>
            <a
              href="#classes"
              className="reveal-up d3 rounded-xl bg-white px-6 py-3 text-base font-semibold text-brand-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-md"
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
                <article key={r.id} className="flex h-56 flex-col rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
                  {r.rating ? <Stars rating={r.rating} /> : null}
                  <p className="mt-2 line-clamp-4 leading-relaxed text-ink">“{r.quote}”</p>
                  <p className="mt-auto pt-3 text-sm font-semibold text-muted">— {r.name}</p>
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

        {GALLERY.length > 0 ? (
          <section className="mx-auto max-w-5xl px-4 py-14">
            <h2 className="text-2xl font-bold text-ink">From the dance floor</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {GALLERY.slice(0, 4).map((photo) => (
                <div
                  key={photo.src}
                  className="relative aspect-square overflow-hidden rounded-xl border border-brand-100"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 640px) 25vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/gallery" className="text-sm font-semibold text-brand-700 hover:underline">
                See the gallery →
              </Link>
            </div>
          </section>
        ) : null}

        <section id="about" className="bg-brand-50/60">
          <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-16 sm:grid-cols-2">
            <div className="mx-auto w-full max-w-sm sm:max-w-none">
              <Image
                src="/emily.jpg"
                alt="Emily, dance fitness instructor"
                width={1017}
                height={1400}
                sizes="(min-width: 640px) 45vw, 100vw"
                className="h-auto w-full rounded-2xl border border-brand-100 object-cover shadow-sm"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ink">About Emily</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-muted">
                {ABOUT_PARAGRAPHS.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
