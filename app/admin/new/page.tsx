import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { NewClassForm } from "./NewClassForm";
import { DEFAULT_CURRENCY } from "@/lib/config";

export const dynamic = "force-dynamic";

export default function NewClassPage() {
  return (
    <AdminShell>
      <div className="mb-4">
        <Link
          href="/admin"
          className="-mx-2 inline-flex min-h-11 items-center px-2 text-sm font-medium text-muted hover:text-brand-700"
        >
          ← Back
        </Link>
        <h2 className="mt-2 text-lg font-bold text-ink">New class</h2>
        <p className="text-sm text-muted">
          Create a class, then share its link so people can join and pay.
        </p>
      </div>
      <div className="card">
        <NewClassForm defaultCurrency={DEFAULT_CURRENCY} />
      </div>
    </AdminShell>
  );
}
