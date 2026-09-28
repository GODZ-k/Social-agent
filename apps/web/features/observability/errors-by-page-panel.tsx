import { Panel } from "@repo/ui/components/states";
import { BarLabel } from "./bar-label";

/** Which pages people were on when they hit an error, by how many people: a labelled red bar per page. */
export function ErrorsByPagePanel({ rows }: { rows: { page: string; people: number }[] }) {
  const max = Math.max(...rows.map((r) => r.people), 1);
  return (
    <Panel>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="type-heading">Where errors happen</h2>
          <p className="type-label mt-1">Pages, by people affected.</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="type-number text-xl">{rows.length}</p>
          <p className="type-label mt-0.5">Pages</p>
        </div>
      </div>
      <div className="grid gap-2.5">
        {rows.map((row) => {
          const pct = Math.max((row.people / max) * 100, 8);
          return (
            <div key={row.page} className="grid grid-cols-[minmax(0,1fr)_3rem] items-center gap-3.5">
              <div className="relative h-9 rounded-xl bg-secondary/70">
                <div className="h-full overflow-hidden rounded-xl" style={{ width: `${pct}%` }}>
                  <div className="h-full rounded-xl" style={{ background: "color-mix(in srgb, var(--destructive) 55%, var(--card))" }} />
                </div>
                <BarLabel pct={pct}>{row.page}</BarLabel>
              </div>
              <span className="text-right font-medium tabular-nums">{row.people}</span>
            </div>
          );
        })}
      </div>
      <p className="type-label mt-4">A person can hit more than one page.</p>
    </Panel>
  );
}
