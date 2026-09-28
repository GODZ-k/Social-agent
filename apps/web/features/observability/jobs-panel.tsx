import type { JobQueueRow } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { RowList, type RowListColumn } from "./row-list";
import { formatMs } from "./format";

const COLUMNS: RowListColumn<JobQueueRow>[] = [
  {
    header: "Queue",
    main: true,
    render: (j) => (
      <span className="flex min-w-0 items-start gap-2">
        <span aria-hidden className={j.waiting > 0 ? "mt-1.5 size-2 shrink-0 rounded-full bg-warning" : "mt-1.5 size-2 shrink-0 rounded-full bg-success"} />
        <span className="min-w-0">
          <span className="block font-medium">{j.name}</span>
          <span className="type-label block">{j.note}</span>
        </span>
      </span>
    ),
  },
  { header: "Waiting", align: "right", width: "4.5rem", render: (j) => j.waiting },
  { header: "Running", align: "right", width: "4.5rem", render: (j) => j.running },
  { header: "Longest wait", align: "right", width: "6rem", render: (j) => formatMs(j.longestWaitMs) },
  { header: "Done", align: "right", width: "4rem", render: (j) => j.done },
  { header: "Failed", align: "right", width: "4rem", render: (j) => <span className={j.failed > 0 ? "font-medium text-destructive" : ""}>{j.failed}</span> },
];

/** Work the API does after it has answered. */
export function JobsPanel({ jobs }: { jobs: JobQueueRow[] }) {
  const active = jobs.reduce((sum, j) => sum + j.waiting + j.running, 0);
  return (
    <Panel>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="type-heading">Background jobs</h2>
          <p className="type-label mt-1">Work the API does after it has answered.</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="type-number text-xl">{active}</p>
          <p className="type-label mt-0.5">Waiting or running</p>
        </div>
      </div>
      <RowList columns={COLUMNS} rows={jobs} rowKey={(j) => j.name} />
    </Panel>
  );
}
