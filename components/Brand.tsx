import { SITE_NAME } from "@/lib/config";
import { DiscoBall } from "@/components/DiscoBall";

/** Brand wordmark used on the login, payment, and confirmation screens. */
export function Brand({ subtitle }: { subtitle?: string }) {
  return (
    <div className="text-center">
      <div className="brand-grad mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-md">
        <DiscoBall size={36} id="db-brand" />
      </div>
      <h1 className="text-xl font-bold tracking-tight text-ink">{SITE_NAME}</h1>
      {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
    </div>
  );
}
