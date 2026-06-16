import { ClassCard } from "./ClassCard";
import type { PublicClass } from "@/lib/classes";

export function ClassGrid({ classes }: { classes: PublicClass[] }) {
  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
      {classes.map((c) => (
        <ClassCard key={c.token} cls={c} />
      ))}
    </div>
  );
}
