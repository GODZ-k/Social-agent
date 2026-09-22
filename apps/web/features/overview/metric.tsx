import { cn, formatDelta } from "@/lib/utils";

export function Metric({ label, value, delta, hint }: { label: string; value: string; delta?: number; hint?: string }) {
  return (
    <div className="rounded-xl bg-card p-4 shadow-raised md:p-5">
      <dt className="type-label">{label}</dt>
      <dd className="mt-1">
        <span className="type-number text-[1.75rem] leading-none md:text-[2rem]">{value}</span>
        <span className={cn("mt-1 block text-[0.8125rem] tabular-nums", deltaTone(delta))}>{deltaLine(delta, hint)}</span>
      </dd>
    </div>
  );
}

/** A metric without a delta reads as plain supporting text, not as a result. */
function deltaTone(delta: number | undefined): string {
  if (delta === undefined || delta === 0) return "text-muted-foreground";
  return delta < 0 ? "text-destructive" : "text-success";
}

function deltaLine(delta: number | undefined, hint: string | undefined): string | undefined {
  if (delta === undefined) return hint;
  if (delta === 0) return "No change this month";
  return `${formatDelta(delta)} this month`;
}
