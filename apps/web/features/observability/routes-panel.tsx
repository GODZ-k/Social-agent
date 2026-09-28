"use client";

import { useMemo, useState } from "react";
import type { RouteRow } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { Segmented } from "@repo/ui/components/segmented";
import { RowList, type RowListColumn } from "./row-list";
import { formatMs } from "./format";
import { signozRequestsUrl } from "./signoz";
import { formatCompact } from "@/lib/utils";

type Sort = "errors" | "slowest" | "busiest";

const SORTERS: Record<Sort, (a: RouteRow, b: RouteRow) => number> = {
  errors: (a, b) => b.errors - a.errors,
  slowest: (a, b) => b.p95Ms - a.p95Ms,
  busiest: (a, b) => b.requests - a.requests,
};

const COLUMNS: RowListColumn<RouteRow>[] = [
  {
    header: "Route",
    main: true,
    render: (r) => (
      <span className="flex min-w-0 items-center gap-2">
        <span className={r.method === "POST" ? "rounded-md bg-tint px-1.5 py-0.5 font-mono text-[0.6875rem] font-medium text-tint-foreground uppercase" : "rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[0.6875rem] font-medium uppercase"}>
          {r.method}
        </span>
        <span className="min-w-0 break-all font-mono text-[0.8125rem]">{r.path}</span>
      </span>
    ),
  },
  { header: "Requests", align: "right", width: "4.5rem", render: (r) => formatCompact(r.requests) },
  { header: "Errors", align: "right", width: "4rem", render: (r) => <span className={r.errors > 0 ? "font-medium text-destructive" : ""}>{r.errors}</span> },
  {
    header: "Error rate",
    align: "right",
    width: "7rem",
    render: (r) => {
      const rate = r.requests > 0 ? Math.round((r.errors / r.requests) * 100) : 0;
      return (
        <span className="flex items-center justify-end gap-2">
          <span className="tabular-nums">{rate}%</span>
          <span className="h-1.5 w-10 shrink-0 overflow-hidden rounded-full bg-secondary">
            <span className="block h-full rounded-full bg-destructive" style={{ width: `${rate}%` }} />
          </span>
        </span>
      );
    },
  },
  { header: "p95", align: "right", width: "4.5rem", render: (r) => <span className={r.p95Ms > 1000 ? "font-medium text-warning" : ""}>{formatMs(r.p95Ms)}</span> },
];

/** Every endpoint, with how often it fails and how slow it gets. */
export function RoutesPanel({ routes }: { routes: RouteRow[] }) {
  const [sort, setSort] = useState<Sort>("errors");
  const sorted = useMemo(() => [...routes].sort(SORTERS[sort]), [routes, sort]);

  return (
    <Panel>
      <h2 className="type-heading">Routes</h2>
      <p className="type-label mt-1 mb-4">Every endpoint, with how often it fails and how slow it gets. Open one for its requests.</p>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Sort routes"
          value={sort}
          onValueChange={setSort}
          options={[
            { value: "errors", label: "Most errors" },
            { value: "slowest", label: "Slowest" },
            { value: "busiest", label: "Busiest" },
          ]}
        />
        <span className="type-label">p95 over 1 s is marked</span>
      </div>
      <RowList columns={COLUMNS} rows={sorted} rowKey={(r) => `${r.method} ${r.path}`} href={(r) => signozRequestsUrl(r.path)} />
    </Panel>
  );
}
