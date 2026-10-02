import { cn } from "../lib/utils";

/** Done segments fill, the live one sweeps, later ones stay empty — same order as `LoopTicks`. */
function segmentFill(index: number, currentIndex: number): string {
  if (index < currentIndex) return "bg-primary/45";
  if (index === currentIndex) return "step-meter-now";
  return "bg-input";
}

/**
 * Equal-width progress segments for a long-running job: done ones filled, the live one
 * sweeping, the rest empty. Mirrors `LoopTicks`' done/now/later treatment
 * (`social/loop-track.tsx`) without its domain type — every prop here is a number or a
 * string, so any multi-step run can use it.
 */
export function StepMeter({
  total,
  currentIndex,
  label,
  className,
}: {
  /** How many segments the run has. */
  total: number;
  /** 0-based index of the segment in progress. */
  currentIndex: number;
  /** The live step's name, read out as "Step N of M: <label>". */
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn("grid gap-1.5", className)}
      style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
      role="img"
      aria-label={`Step ${currentIndex + 1} of ${total}: ${label}`}
    >
      {Array.from({ length: total }, (_, index) => (
        <span key={index} className={cn("h-2 rounded-full", segmentFill(index, currentIndex))} />
      ))}
    </div>
  );
}
