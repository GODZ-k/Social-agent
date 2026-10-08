import { cn } from "@/lib/utils";

const ITEMS = [
  { label: "Needs approval", dot: "bg-warning" },
  { label: "Scheduled", dot: "bg-tint-foreground" },
  { label: "Approved, waiting for a connection", dot: "bg-muted-foreground" },
  { label: "Published", dot: "bg-success" },
  { label: "Free best time", dot: "border border-dashed border-muted-foreground/60 bg-transparent" },
] as const;

/** What each chip colour means, spelled out next to the grid so nobody has to guess. */
export function CalendarLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground", className)}>
      {ITEMS.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span className={cn("size-2.5 shrink-0 rounded-full", item.dot)} aria-hidden />
          {item.label}
        </span>
      ))}
    </div>
  );
}
