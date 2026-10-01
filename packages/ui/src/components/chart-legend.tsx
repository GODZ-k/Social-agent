import { cn } from "../lib/utils";

/** One legend entry: a coloured dot and its label. The dot takes a CSS colour, or a class (for a token like `bg-destructive`). */
export interface LegendItem {
  label: string;
  color?: string;
  swatchClassName?: string;
}

/** The small coloured-dot legend under a chart's title, naming what each line or segment is. */
export function ChartLegend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-4 text-[0.8125rem]", className)}>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <i aria-hidden className={cn("inline-block size-2 rounded-full", item.swatchClassName)} style={item.color ? { background: item.color } : undefined} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
