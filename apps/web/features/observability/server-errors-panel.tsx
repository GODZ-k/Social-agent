import { format, parseISO } from "date-fns";
import type { ServerErrorGroup } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { RowList, type RowListColumn } from "./row-list";
import { SignozTraceLink } from "./signoz-link";

const COLUMNS: RowListColumn<ServerErrorGroup>[] = [
  {
    header: "Error",
    main: true,
    render: (e) => (
      <span className="min-w-0">
        <span className="block font-mono text-[0.8125rem]">{e.message}</span>
        <span className="type-label block font-mono">{e.route}</span>
      </span>
    ),
  },
  { header: "Times", align: "right", width: "4rem", render: (e) => <span className="font-medium">{e.times}</span> },
  { header: "Clients", align: "right", width: "4.5rem", render: (e) => e.clients },
  { header: "Last seen", align: "right", width: "7rem", render: (e) => format(parseISO(e.lastSeenAt), "d MMM, h:mm a") },
  { header: "", align: "right", width: "5rem", render: (e) => <SignozTraceLink traceId={e.traceId} /> },
];

/** Requests that ended in a 5xx, grouped by cause. Most frequent first. */
export function ServerErrorsPanel({ errors }: { errors: ServerErrorGroup[] }) {
  return (
    <Panel>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="type-heading">Server errors</h2>
          <p className="type-label mt-1">Requests that ended in a 5xx, grouped by cause. Most frequent first.</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="type-number text-xl">{errors.length}</p>
          <p className="type-label mt-0.5">Causes</p>
        </div>
      </div>
      <RowList columns={COLUMNS} rows={errors} rowKey={(e) => e.id} />
    </Panel>
  );
}
