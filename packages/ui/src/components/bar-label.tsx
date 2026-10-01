import { cn } from "../lib/utils";

/** A bar short enough that its own label would not fit in white text; the label moves outside it instead. */
const SHORT_BAR_PCT = 30;

/** A horizontal bar's label: inside the bar in white, or just past its end in dark text when the bar is too short to hold it. Place inside the bar's `relative` track. */
export function BarLabel({ pct, children }: { pct: number; children: React.ReactNode }) {
  const outside = pct < SHORT_BAR_PCT;
  return (
    <span
      className={cn(
        "absolute inset-y-0 flex items-center truncate text-sm font-medium",
        outside ? "pl-3 text-foreground" : "inset-x-0 px-3.5 text-white",
      )}
      style={outside ? { left: `${pct}%` } : undefined}
    >
      {children}
    </span>
  );
}
