import { DiscoBall } from "@/components/DiscoBall";

// Shown during navigation/data fetches so dynamic pages never flash a blank screen.
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <span className="brand-grad inline-flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-md motion-safe:animate-pulse">
        <DiscoBall size={40} id="db-loading" animated />
      </span>
      <p className="text-sm font-medium text-muted">Loading…</p>
    </div>
  );
}
