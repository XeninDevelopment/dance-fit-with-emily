import { AdminNav } from "@/components/AdminNav";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <AdminNav />
      <main className="container-app py-6">{children}</main>
    </div>
  );
}
