import { cn } from "@/lib/utils";

/** One entry per ghost row; each fades a little more than the one above it. */
const ROW_OPACITY = ["", "opacity-70", "opacity-45"];

/**
 * ST-5: dashed outlines of the row shape a post will take, shown while the table has no real
 * rows yet. `working` breathes them one after another while the agent drafts; still, they read
 * as "nothing yet", not as a loading skeleton (ST-3 owns that, on `loading.tsx`).
 */
export function ContentGhostRows({ working = false }: { working?: boolean }) {
  // Reuses the global `skeleton-pulse` keyframes (packages/ui/src/styles/globals.css) by name,
  // rather than the `.skeleton` class, so each ghost's own rounding survives.
  const breathe = (i: number): React.CSSProperties | undefined =>
    working ? { animation: "skeleton-pulse 1.6s ease-in-out infinite", animationDelay: `${i * 0.3}s` } : undefined;

  return (
    <div aria-hidden className="mx-auto mb-8 grid max-w-lg gap-2.5">
      {ROW_OPACITY.map((opacity, i) => (
        <div
          key={i}
          className={cn(
            "grid grid-cols-[3rem_minmax(0,1fr)_5rem] items-center gap-3.5 rounded-2xl border-[1.5px] border-dashed border-muted-foreground/35 p-2.5",
            opacity,
          )}
        >
          <span className="size-12 rounded-xl bg-muted" style={breathe(i)} />
          <span className="grid gap-1.5">
            <span className="h-2 w-3/4 rounded-full bg-muted" style={breathe(i)} />
            <span className="h-2 w-2/5 rounded-full bg-muted" style={breathe(i)} />
          </span>
          <span className="h-6 rounded-full bg-muted" style={breathe(i)} />
        </div>
      ))}
    </div>
  );
}
