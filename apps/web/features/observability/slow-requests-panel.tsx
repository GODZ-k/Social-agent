import { format, parseISO } from "date-fns";
import type { SlowRequest } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { RowList, type RowListColumn } from "./row-list";
import { PanelHeader } from "@repo/ui/components/panel-header";
import { BrandBadge } from "./brand-badge";
import { formatMs } from "./format";
import { SignozTraceLink } from "./signoz-link";

const COLUMNS: RowListColumn<SlowRequest>[] = [
  {
    header: "Request",
    main: true,
    render: (r) => (
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[0.6875rem] font-medium uppercase">{r.method}</span>
          <span className="min-w-0 break-all font-mono text-[0.8125rem]">{r.path}</span>
        </span>
        <span className="type-label block">{r.waitedOn}</span>
      </span>
    ),
  },
  { header: "Took", align: "right", width: "4.5rem", render: (r) => <span className="font-medium">{formatMs(r.tookMs)}</span> },
  { header: "Client", width: "9rem", render: (r) => <BrandBadge name={r.brandName} /> },
  { header: "When", align: "right", width: "4.5rem", render: (r) => format(parseISO(r.at), "h:mm a") },
  { header: "", align: "right", width: "5rem", render: (r) => <SignozTraceLink traceId={r.traceId} /> },
];

/** The three longest requests, and what they waited on. */
export function SlowRequestsPanel({ requests }: { requests: SlowRequest[] }) {
  return (
    <Panel>
      <PanelHeader title="Slowest requests" description="The three longest requests, and what they waited on." />
      <RowList columns={COLUMNS} rows={requests} rowKey={(r) => r.traceId} />
    </Panel>
  );
}
