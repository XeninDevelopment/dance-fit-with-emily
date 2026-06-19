import { Brand } from "@/components/Brand";
import { formatMoney } from "@/lib/money";
import { formatDateTime } from "@/lib/datetime";
import { mapsDirectionsUrl } from "@/lib/maps";

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
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-center text-xs text-muted">Powered by Stripe</p>
      </div>
    </main>
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
