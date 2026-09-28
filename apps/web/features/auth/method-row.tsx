import type { LucideIcon } from "lucide-react";

/** One sign-in method: what it is, when it was used, and what can be done with it. */
export function MethodRow({ icon: Icon, title, detail, note, children }: { icon: LucideIcon; title: string; detail: string; note?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3.5 gap-y-2 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
      <span className="grid size-10 place-items-center rounded-[0.875rem] bg-tint text-tint-foreground">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        <p className="type-label text-muted-foreground">{detail}</p>
      </div>
      <div className="col-start-2 sm:col-start-auto">{children}</div>
      {note ? <div className="col-span-full sm:col-start-2">{note}</div> : null}
    </div>
  );
}
