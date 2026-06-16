import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { ClassGrid } from "@/components/ClassGrid";
import { getUpcomingClasses } from "@/lib/classes";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const classes = await getUpcomingClasses();
  const themed = classes.filter((c) => c.themed);
  const standard = classes.filter((c) => !c.themed);

  return (
    <div className="min-h-dvh">
      <PublicHeader />

      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Upcoming classes</h1>
        <p className="mt-1 text-muted">Book and pay online — your spot is confirmed instantly.</p>

        {classes.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-10 text-center">
            <p className="font-semibold text-ink">No classes scheduled right now</p>
            <p className="mt-1 text-sm text-muted">New classes will appear here as soon as they’re added.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {themed.length > 0 ? (
              <section>
                <h2 className="text-xl font-bold text-ink">Themed &amp; special classes</h2>
                <div className="mt-4">
                  <ClassGrid classes={themed} />
                </div>
              </section>
            ) : null}

            {standard.length > 0 ? (
              <section>
                {themed.length > 0 ? (
                  <h2 className="text-xl font-bold text-ink">Regular classes</h2>
                ) : null}
                <div className={themed.length > 0 ? "mt-4" : ""}>
                  <ClassGrid classes={standard} />
                </div>
              </section>
            ) : null}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
