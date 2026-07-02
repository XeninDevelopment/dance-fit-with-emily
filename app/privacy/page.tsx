import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { SITE_NAME, CONTACT, LEGAL_ENTITY } from "@/lib/config";

export const dynamic = "force-dynamic";

const DESC = `How your personal data is collected, used and protected when you use ${SITE_NAME}.`;
export const metadata: Metadata = {
  title: "Privacy Policy",
  description: DESC,
  openGraph: { title: `Privacy Policy · ${SITE_NAME}`, description: DESC },
};

const UPDATED = "2 July 2026";

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 text-xl font-bold text-ink">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 leading-relaxed text-muted">{children}</p>;
}

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Privacy Policy</h1>
        <p className="mt-1 text-sm text-muted">Last updated: {UPDATED}</p>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm text-amber-800">
          This policy is provided in good faith as general information, not legal advice — please
          review it before relying on it.
        </div>

        <P>
          This policy explains what personal data {LEGAL_ENTITY.company} collects when you use this
          website or book a class with {SITE_NAME}, how it is used, and your rights under UK data
          protection law (UK GDPR and the Data Protection Act 2018).
        </P>

        <H2>Who we are</H2>
        <P>
          {SITE_NAME} is operated by {LEGAL_ENTITY.company} (“we”, “us”), which is the data controller
          for the personal data described in this policy. {LEGAL_ENTITY.company} is registered at{" "}
          {LEGAL_ENTITY.address}. For any privacy question or request, contact us at{" "}
          <a href={`mailto:${CONTACT.email}`} className="font-medium text-brand-700 hover:underline">
            {CONTACT.email}
          </a>
          .
        </P>

        <H2>What we collect</H2>
        <P>
          <strong>Booking details</strong> — your name, email address and phone number when you book a
          class. <strong>Payment</strong> — card payments are processed securely by Stripe; we never
          see or store your full card details, only a confirmation of payment. <strong>Reviews</strong>{" "}
          — if you submit a review, the name and review text you provide (published on the site once
          approved). <strong>Photos</strong> — photos and short videos are sometimes taken at classes
          and may appear in our gallery or on our social media; you can opt out or ask for one to be
          removed at any time. <strong>Technical</strong> — your IP address and basic server logs, used
          to keep the site secure and prevent abuse.
        </P>

        <H2>How we use it & our lawful bases</H2>
        <P>
          To take and manage your booking, process any refund, and send your receipt and booking
          confirmation (performance of a contract); to keep the site secure and respond to enquiries
          (our legitimate interests); to publish a review you have chosen to submit, or a class photo
          you are happy to appear in (consent, which you can withdraw at any time by asking us to
          remove it); and to keep financial records as required (legal obligation).
        </P>

        <H2>Who we share it with</H2>
        <P>
          We use trusted providers who process data on {LEGAL_ENTITY.company}’s behalf:{" "}
          <strong>Stripe</strong> (payment processing and payment receipts), <strong>Supabase</strong>{" "}
          (database hosting), <strong>Vercel</strong> (website hosting) and <strong>Resend</strong>{" "}
          (sending booking confirmation emails). We do not sell your data. Some providers may process
          data outside the UK/EEA under appropriate safeguards.
        </P>

        <H2>Cookies & analytics</H2>
        <P>
          We use a single strictly-necessary cookie to keep the studio admin logged in. On booking
          pages, Stripe sets its own strictly-necessary cookies to process payments securely and
          prevent fraud. We do not use advertising cookies. We use privacy-friendly analytics (Vercel
          Web Analytics), which is cookieless and does not collect personal data. Embedded Spotify
          players, where shown, may set their own cookies under Spotify’s policy.
        </P>

        <H2>How long we keep it</H2>
        <P>
          Booking and payment records are kept for around six years to meet tax and accounting
          requirements, then deleted. Reviews are kept until you ask us to remove them. Technical logs
          are kept only for a short period.
        </P>

        <H2>Your rights</H2>
        <P>
          You have the right to access, correct, delete or restrict the use of your personal data, to
          object to processing, and to data portability. To exercise any of these, email us at{" "}
          <a href={`mailto:${CONTACT.email}`} className="font-medium text-brand-700 hover:underline">
            {CONTACT.email}
          </a>
          . You can also complain to the Information Commissioner’s Office (ICO) at{" "}
          <a
            href="https://ico.org.uk"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-brand-700 hover:underline"
          >
            ico.org.uk
          </a>
          .
        </P>

        <P>
          See also our{" "}
          <Link href="/terms" className="font-medium text-brand-700 hover:underline">
            Terms &amp; Conditions
          </Link>
          .
        </P>
      </main>
      <PublicFooter />
    </div>
  );
}
