import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Panel } from "@repo/ui/components/states";
import { BarLabel } from "./bar-label";
import { formatUsd } from "./format";

/** Who the AI spend was for, ranked highest first: a labelled bar per client, its dollar value at the right. */
export function CostByClientPanel({
  title,
  description,
  rows,
  clientsHref,
}: {
  title: string;
  description: string;
  rows: { brandId: string; name: string; cost: number }[];
  clientsHref?: string;
}) {
  const total = rows.reduce((sum, r) => sum + r.cost, 0);
  const max = Math.max(...rows.map((r) => r.cost), 1);
  return (
    <Panel>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="type-heading">{title}</h2>
          <p className="type-label mt-1">{description}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="type-number text-xl">{formatUsd(total)}</p>
          <p className="type-label mt-0.5">{rows.length === 1 ? "Top client" : `Top ${rows.length} clients`}</p>
        </div>
      </div>
      <div className="grid gap-2.5">
        {rows.map((row) => {
          const pct = Math.max((row.cost / max) * 100, 8);
          return (
            <div key={row.brandId} className="grid grid-cols-[minmax(0,1fr)_4.5rem] items-center gap-3.5">
              <div className="relative h-9 rounded-xl bg-secondary/70">
                <div className="h-full overflow-hidden rounded-xl" style={{ width: `${pct}%` }}>
                  <div className="h-full rounded-xl bg-primary" />
                </div>
                <BarLabel pct={pct}>{row.name}</BarLabel>
              </div>
              <span className="text-right font-medium tabular-nums">{formatUsd(row.cost)}</span>
            </div>
          );
        })}
      </div>
      {clientsHref && (
        <p className="mt-4">
          <Link href={clientsHref} className="inline-flex items-center gap-0.5 text-sm font-medium text-tint-foreground hover:underline">
            All clients <ChevronRight className="size-3.5" />
          </Link>
        </p>
      )}
    </Panel>
  );
}
