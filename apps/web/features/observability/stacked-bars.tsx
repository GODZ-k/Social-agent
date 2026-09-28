import { BarLabel } from "./bar-label";

/** One stacked horizontal bar: its segments' totals, the row's label inside the bar (or just past it, in dark text, when the bar is too short to hold it), the grand total at the right. */
export function StackedBars({
  rows,
  formatValue,
}: {
  rows: { key: string; label: string; segments: { value: number; color: string }[] }[];
  formatValue: (n: number) => string;
}) {
  const totals = rows.map((row) => row.segments.reduce((sum, seg) => sum + seg.value, 0));
  const max = Math.max(...totals, 1);

  return (
    <div className="grid gap-2.5">
      {rows.map((row, i) => {
        const total = totals[i]!;
        const pct = (total / max) * 100;
        return (
          <div key={row.key} className="grid grid-cols-[minmax(0,1fr)_4.5rem] items-center gap-3.5">
            <div className="relative flex h-9 rounded-xl bg-secondary/70">
              <div className="flex h-full overflow-hidden rounded-xl" style={{ width: `${pct}%` }}>
                {row.segments.map((seg, segIndex) => (
                  <span
                    key={segIndex}
                    style={{ width: `${(seg.value / total) * 100}%`, background: seg.color }}
                    className="h-full first:rounded-l-xl last:rounded-r-xl"
                  />
                ))}
              </div>
              <BarLabel pct={pct}>{row.label}</BarLabel>
            </div>
            <span className="text-right font-medium tabular-nums">{formatValue(total)}</span>
          </div>
        );
      })}
    </div>
  );
}
