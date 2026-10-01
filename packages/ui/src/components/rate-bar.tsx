/** A percentage next to a small filled track, for a row's error or failure rate. */
export function RateBar({ pct }: { pct: number }) {
  return (
    <span className="flex items-center gap-2">
      <span className="tabular-nums">{pct}%</span>
      <span className="h-1.5 w-10 shrink-0 overflow-hidden rounded-full bg-secondary">
        <span className="block h-full rounded-full bg-destructive" style={{ width: `${pct}%` }} />
      </span>
    </span>
  );
}
