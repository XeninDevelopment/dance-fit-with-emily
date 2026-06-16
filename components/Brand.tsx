import { SITE_NAME } from "@/lib/config";

/** Brand wordmark used on the login, payment, and confirmation screens. */
export function Brand({ subtitle }: { subtitle?: string }) {
  return (
    <div className="text-center">
      <div className="brand-grad mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-7 w-7"
          aria-hidden="true"
        >
          <path d="M9 17.5a3.5 3.5 0 1 1-2.5-3.355V5.5a1 1 0 0 1 .757-.97l9-2.25A1 1 0 0 1 19 3.25v9.25a3.5 3.5 0 1 1-2-3.163V7.78l-8 2V14a1 1 0 0 1 0 .093V17.5Z" />
        </svg>
      </div>
      <h1 className="text-xl font-bold tracking-tight text-ink">{SITE_NAME}</h1>
      {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
    </div>
  );
}
