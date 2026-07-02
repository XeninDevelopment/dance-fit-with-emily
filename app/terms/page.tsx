import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { SITE_NAME, CONTACT, SERVICE_AREA, LEGAL_ENTITY } from "@/lib/config";

export const dynamic = "force-dynamic";

const DESC = `Booking terms, refund policy and health information for ${SITE_NAME} classes.`;
export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: DESC,
  openGraph: { title: `Terms & Conditions · ${SITE_NAME}`, description: DESC },
};

const UPDATED = "2 July 2026";

function H2({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-8 scroll-mt-24 text-xl font-bold text-ink">
      {children}
    </h2>
  );
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 leading-relaxed text-muted">{children}</p>;
}

export default function TermsPage() {
  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Terms &amp; Conditions</h1>
        <p className="mt-1 text-sm text-muted">Last updated: {UPDATED}</p>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm text-amber-800">
          This is provided in good faith as general information, not legal advice — please review it
          before relying on it.
        </div>

        <P>
          {SITE_NAME} is operated by {LEGAL_ENTITY.company} (registered at {LEGAL_ENTITY.address}).
          These terms apply when you book and attend a dance fitness class run by {SITE_NAME} in{" "}
          {SERVICE_AREA}; your booking is a contract with {LEGAL_ENTITY.company}. By booking a class
          you agree to them.
        </P>

        <H2>Bookings &amp; payment</H2>
        <P>
          Classes are booked and paid for online in advance. Prices are shown in pounds sterling (GBP)
          and are per person. Payment is taken securely via Stripe; your place is confirmed only once
          payment has succeeded, and a receipt is emailed to you. Where a class has limited capacity,
          places are allocated on a first-paid basis.
        </P>

        <H2 id="refunds">Cancellations &amp; refunds</H2>
        <P>
          You can receive a full refund if you cancel at least <strong>48 hours</strong> before the
          class start time. Cancellations made within 48 hours of the class are not eligible for a
          refund. To request a refund, email{" "}
          <a href={`mailto:${CONTACT.email}`} className="font-medium text-brand-700 hover:underline">
            {CONTACT.email}
          </a>{" "}
          with your name and the class details. If we cancel or reschedule a class, you will be offered
          a transfer to another class or a full refund.
        </P>

        <H2>Venues &amp; memberships</H2>
        <P>
          Some classes take place at partner venues. Classes held at JD Gyms require a valid JD Gyms
          membership in addition to your class booking; memberships are arranged directly through the
          JD Gyms website and are not included in the class price. Please check the venue details on
          each class page before booking.
        </P>

        <H2>Health &amp; safety</H2>
        <P>
          Dance fitness is a physical activity. You take part at your own risk and are responsible for
          exercising within your own limits. If you have any injury, medical condition, are pregnant,
          or are unsure whether exercise is suitable for you, please consult your GP before taking
          part, and let Emily know so classes can be adapted where possible. Stop and rest if you feel
          unwell. This information is not medical advice.
        </P>

        <H2>Our liability</H2>
        <P>
          To the extent permitted by law, we are not liable for loss or injury arising from your
          participation other than where caused by our negligence. Nothing in these terms limits or
          excludes our liability for death or personal injury caused by negligence, or for anything
          else that cannot be limited or excluded under law. Your statutory rights are not affected.
        </P>

        <H2>Reviews &amp; conduct</H2>
        <P>
          If you submit a review, the name and text you provide may be published on the site once
          approved; please keep it honest and respectful. We may decline or remove content that is
          abusive, false or inappropriate.
        </P>

        <H2>Photos &amp; social media</H2>
        <P>
          Photos and short videos are sometimes taken at classes to share the fun — for example in the
          website gallery or on {SITE_NAME}’s social media. If you’d rather not appear, just tell Emily
          at class (or email{" "}
          <a href={`mailto:${CONTACT.email}`} className="font-medium text-brand-700 hover:underline">
            {CONTACT.email}
          </a>
          ) and we’ll make sure you’re left out. If a photo of you is already published and you’d like
          it removed, ask and we’ll take it down. See the{" "}
          <Link href="/privacy" className="font-medium text-brand-700 hover:underline">
            Privacy Policy
          </Link>{" "}
          for how images are handled as personal data.
        </P>

        <H2>Changes &amp; governing law</H2>
        <P>
          We may update these terms from time to time; the version in force is the one published here
          when you book. These terms are governed by the laws of England and Wales. See also our{" "}
          <Link href="/privacy" className="font-medium text-brand-700 hover:underline">
            Privacy Policy
          </Link>
          . Questions? Email{" "}
          <a href={`mailto:${CONTACT.email}`} className="font-medium text-brand-700 hover:underline">
            {CONTACT.email}
          </a>
          .
        </P>
      </main>
      <PublicFooter />
    </div>
  );
}
