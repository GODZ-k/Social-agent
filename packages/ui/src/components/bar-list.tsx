import { BarLabel } from "./bar-label";

/** One ranked list of labelled bars: highest value first, a floor of 8% so even a small bar can hold its label. */
export function BarList<T>({
  rows,
  keyOf,
  labelOf,
  valueOf,
  formatValue,
  fillColor = "var(--primary)",
  valueWidth = "4.5rem",
}: {
  rows: T[];
  keyOf: (row: T) => string;
  labelOf: (row: T) => string;
  valueOf: (row: T) => number;
  formatValue: (n: number) => string;
  /** The bar's fill colour; a design token expression like "var(--primary)". */
  fillColor?: string;
  /** The value column's fixed width, so bars of different lists can line up with their own numbers. */
  valueWidth?: string;
}) {
  const max = Math.max(...rows.map(valueOf), 1);
  return (
    <div className="grid gap-2.5">
      {rows.map((row) => {
        const value = valueOf(row);
        const pct = Math.max((value / max) * 100, 8);
        return (
          <div key={keyOf(row)} className="grid items-center gap-3.5" style={{ gridTemplateColumns: `minmax(0,1fr) ${valueWidth}` }}>
            <div className="relative h-9 rounded-xl bg-secondary/70">
              <div className="h-full overflow-hidden rounded-xl" style={{ width: `${pct}%` }}>
                <div className="h-full rounded-xl" style={{ background: fillColor }} />
              </div>
              <BarLabel pct={pct}>{labelOf(row)}</BarLabel>
            </div>
            <span className="text-right font-medium tabular-nums">{formatValue(value)}</span>
          </div>
        );
      })}
    </div>
  );
}
