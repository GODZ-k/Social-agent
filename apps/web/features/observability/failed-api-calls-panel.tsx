import type { FailedApiCallRow } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { Badge } from "@repo/ui/components/badge";
import { RowList, type RowListColumn } from "./row-list";
import { PanelHeader } from "@repo/ui/components/panel-header";
import { PanelStat } from "@repo/ui/components/panel-stat";
import { MethodBadge } from "./method-badge";
import { SignozTraceLink } from "./signoz-link";

const COLUMNS: RowListColumn<FailedApiCallRow>[] = [
  {
    header: "Call and what the person was doing",
    main: true,
    render: (c) => (
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <MethodBadge method={c.method} />
          <span className="font-mono text-[0.8125rem]">{c.path}</span>
        </span>
        <span className="type-label block">{c.doing}</span>
      </span>
    ),
  },
  { header: "Status", width: "6rem", render: (c) => <Badge variant={c.status === "timeout" ? "warning" : "danger"}>{c.status === "timeout" ? "Timed out" : c.status}</Badge> },
  { header: "Failed", align: "right", width: "4rem", render: (c) => <span className="font-medium">{c.failed}</span> },
  { header: "People", align: "right", width: "4.5rem", render: (c) => c.people },
  { header: "", align: "right", width: "5rem", render: (c) => <SignozTraceLink traceId={c.traceId} /> },
];

/** A plain reason for the status code, for the footer's one-line explanation. */
const STATUS_REASON: Record<number, string> = {
  401: "a sign-in expired",
  403: "a permission was missing",
  404: "the resource was missing",
  429: "the rate limit was hit",
  502: "an upstream service failed",
  504: "a request timed out upstream",
};

/** Calls the app made that came back with an error or no answer. */
export function FailedApiCallsPanel({ calls }: { calls: FailedApiCallRow[] }) {
  const total = calls.reduce((sum, c) => sum + c.failed, 0);
  const worst = [...calls].sort((a, b) => b.failed - a.failed)[0];
  const reason = worst && (typeof worst.status === "number" ? STATUS_REASON[worst.status] : "the request timed out upstream");

  return (
    <Panel>
      <PanelHeader
        title="Failed API calls"
        description="Calls the app made that came back with an error or no answer."
        right={<PanelStat value={total} caption="Failed" />}
      />
      <RowList columns={COLUMNS} rows={calls} rowKey={(c) => c.traceId} />
      {worst && reason && (
        <p className="type-label mt-4">
          {worst.failed} calls ended with {worst.status === "timeout" ? "a timeout" : worst.status} because {reason}.
        </p>
      )}
    </Panel>
  );
}
