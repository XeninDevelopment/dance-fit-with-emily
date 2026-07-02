import Link from "next/link";
import { Brand } from "@/components/Brand";
import { formatMoney } from "@/lib/money";
import { formatDateTime } from "@/lib/datetime";
import { mapsDirectionsUrl } from "@/lib/maps";
import { CONTACT } from "@/lib/config";

export function PayShell({
  children,
  subtitle = "Secure payment",
}: {
  children: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center py-8">
      <div className="container-app">
        <Brand subtitle={subtitle} />
        {/* Let cold visitors from a shared link explore before paying. */}
        <nav className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs font-medium text-muted">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <Link href="/classes" className="hover:text-brand-700">Classes</Link>
          <Link href="/reviews" className="hover:text-brand-700">Reviews</Link>
          <Link href="/faq" className="hover:text-brand-700">FAQ</Link>
        </nav>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-center text-xs text-muted">Powered by Stripe</p>
      </div>
    </main>
  );
}

/** Reassurance shown beneath the booking form: refund, security and contact. */
export function PayReassurance() {
  return (
    <div className="mt-4 rounded-xl border border-brand-100 bg-white/70 p-4 text-sm text-muted">
      <ul className="space-y-1.5">
        <li>✓ Your spot is confirmed the moment payment succeeds.</li>
        <li>✓ Card details are handled securely by Stripe — they never touch this site.</li>
        <li>
          ✓ Full refund up to 48 hours before the class —{" "}
          <Link href="/terms#refunds" className="font-medium text-brand-700 hover:underline">
            refund policy
          </Link>
          .
        </li>
        <li>
          Questions?{" "}
          <a href={`mailto:${CONTACT.email}`} className="font-medium text-brand-700 hover:underline">
            Message Emily
          </a>
          .
        </li>
      </ul>
    </div>
  );
}

export type ClassDetails = {
  danceType: string;
  classDateTime: Date;
  location: string | null;
  amount: number;
  currency: string;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}

export function SummaryCard({
  details,
  customerName,
}: {
  details: ClassDetails;
  customerName?: string;
}) {
  return (
    <div className="card">
      <p className="text-sm font-medium text-brand-700">{details.danceType}</p>
      <p className="mt-3 text-3xl font-bold text-ink">
        {formatMoney(details.amount, details.currency)}
      </p>
      <dl className="mt-4 space-y-1.5 text-sm">
        <Row label="Class" value={formatDateTime(details.classDateTime)} />
        {details.location ? (
          <div className="flex items-start justify-between gap-4">
            <dt className="text-muted">Location</dt>
            <dd className="text-right">
              <span className="font-medium text-ink">{details.location}</span>
              <a
                href={mapsDirectionsUrl(details.location)}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 block text-sm font-medium text-brand-700 hover:underline"
              >
                Get directions →
              </a>
            </dd>
          </div>
        ) : null}
        {customerName ? <Row label="Name" value={customerName} /> : null}
      </dl>
    </div>
  );
}
