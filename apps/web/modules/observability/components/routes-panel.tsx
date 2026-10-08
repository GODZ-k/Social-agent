"use client";

import { useMemo, useState } from "react";
import type { RouteRow } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { Segmented } from "@repo/ui/components/segmented";
import { RowList } from "./row-list";
import { PanelHeader } from "@repo/ui/components/panel-header";
import { MethodBadge } from "./badges";
import { FailedCount } from "@repo/ui/components/failed-count";
import { RateBar } from "@repo/ui/components/rate-bar";
import { formatMs } from "@/modules/observability/utils/format";
import { signozRequestsUrl } from "./signoz";
import { formatCompact } from "@/lib/utils";
import type { RowListColumn } from "@/modules/observability/types";

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
        <MethodBadge method={r.method} />
        <span className="min-w-0 break-all font-mono text-[0.8125rem]">{r.path}</span>
      </span>
    ),
  },
  { header: "Requests", align: "right", width: "4.5rem", render: (r) => formatCompact(r.requests) },
  { header: "Errors", align: "right", width: "4rem", render: (r) => <FailedCount count={r.errors} /> },
  {
    header: "Error rate",
    align: "right",
    width: "7rem",
    render: (r) => <RateBar pct={r.requests > 0 ? Math.round((r.errors / r.requests) * 100) : 0} />,
  },
  { header: "p95", align: "right", width: "4.5rem", render: (r) => <span className={r.p95Ms > 1000 ? "font-medium text-warning" : ""}>{formatMs(r.p95Ms)}</span> },
];

/** Every endpoint, with how often it fails and how slow it gets. */
export function RoutesPanel({ routes }: { routes: RouteRow[] }) {
  const [sort, setSort] = useState<Sort>("errors");
  const sorted = useMemo(() => [...routes].sort(SORTERS[sort]), [routes, sort]);

  return (
    <Panel>
      <PanelHeader title="Routes" description="Every endpoint, with how often it fails and how slow it gets. Open one for its requests." />
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
