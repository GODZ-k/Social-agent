import type { ServiceRow } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { RowList, type RowListColumn } from "./row-list";
import { formatMs } from "./format";
import { formatNumber } from "@/lib/utils";

/** Warning past any failures, danger once a fifth of calls failed. */
function statusDot(service: ServiceRow) {
  if (service.failed === 0) return "bg-success";
  const rate = service.failed / Math.max(service.calls, 1);
  return rate > 0.2 ? "bg-destructive" : "bg-warning";
}

const COLUMNS: RowListColumn<ServiceRow>[] = [
  {
    header: "Service",
    main: true,
    render: (s) => (
      <span className="flex min-w-0 items-start gap-2">
        <span aria-hidden className={`mt-1.5 size-2 shrink-0 rounded-full ${statusDot(s)}`} />
        <span className="min-w-0">
          <span className="block font-medium">{s.name}</span>
          <span className="type-label block">{s.note}</span>
        </span>
      </span>
    ),
  },
  { header: "Calls", align: "right", render: (s) => formatNumber(s.calls) },
  { header: "Failed", align: "right", render: (s) => <span className={s.failed > 0 ? "font-medium text-destructive" : ""}>{s.failed}</span> },
  { header: "p95", align: "right", render: (s) => formatMs(s.p95Ms) },
];

/** Outside services the API calls, and how they answered. */
export function ServicesPanel({ services }: { services: ServiceRow[] }) {
  const failed = services.reduce((sum, s) => sum + s.failed, 0);
  return (
    <Panel>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="type-heading">Services the API calls</h2>
          <p className="type-label mt-1">Outside services, and how they answered.</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="type-number text-xl">{failed}</p>
          <p className="type-label mt-0.5">Failed calls</p>
        </div>
      </div>
      <RowList columns={COLUMNS} rows={services} rowKey={(s) => s.name} />
    </Panel>
  );
}
