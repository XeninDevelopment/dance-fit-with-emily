import type { Metadata } from "next";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { SITE_NAME } from "@/lib/config";

export const dynamic = "force-dynamic";

const DESC = "Common questions about Emily's dance fitness classes — levels, what to bring, parking and bookings.";
export const metadata: Metadata = {
  title: "FAQ",
  description: DESC,
  openGraph: { title: `FAQ · ${SITE_NAME}`, description: DESC },
};

const FAQS: { q: string; a: string }[] = [
  {
    q: "Do I need any dance experience?",
    a: "Dance experience is not necessary at all! There is no pressure to copy exactly everything I do, and moves can be tailored to make you feel good. As I say at the beginning of my classes, as long as you are moving in a way that makes you feel empowered, and confident, that is all that matters!",
  },
  {
    q: "What should I wear and bring?",
    a: "Wear something that you can move in, and feel comfortable moving in! My go to is always active wear and comfortably fitting trainers. Bring lots of water with you, too. I always end up needing more than I bring!",
  },
  {
    q: "How do I book onto a class?",
    a: "Class bookings can be made through the “Book a class” portal, where you can secure your space prior to attending. Payments for the class must be made before attending a class. However, classes in JD Gyms require a membership, which can be sourced through the JD Gyms website.",
  },
  {
    q: "Can I come to a class on my own?",
    a: "Absolutely you can! You may travel to the class on your own, but when you are there, you will be surrounded by so many wonderful people who will make you feel like you have been attending classes for years!",
  },
  {
    q: "Is there parking at the venues?",
    a: "At JD Gyms in Widnes, there is a designated, free customer car park. At Arts Bar Hope Street, there is on street parking outside. If these spaces are taken, there is the Metropolitan Cathedral carpark and Philharmonic Hall carpark a 3 minute walk away.",
  },
  {
    q: "What is your cancellation and refund policy?",
    a: "Refunds can be provided until 48 hours before the class starts. Any cancellations made within this 48 hour period will not be eligible for a refund.",
  },
];

function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="h-5 w-5 shrink-0 text-brand-600 transition group-open:rotate-180"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function FaqPage() {
  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Frequently asked questions</h1>
        <p className="mt-1 text-muted">Everything new dancers usually want to know.</p>

        <div className="mt-8 space-y-3">
          {FAQS.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-brand-100 bg-white p-5 shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {item.q}
                <Chevron />
              </summary>
              <p className="mt-3 leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
