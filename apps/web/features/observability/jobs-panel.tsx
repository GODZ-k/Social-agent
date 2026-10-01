import type { JobQueueRow } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { RowList, type RowListColumn } from "./row-list";
import { PanelHeader } from "@repo/ui/components/panel-header";
import { PanelStat } from "@repo/ui/components/panel-stat";
import { FailedCount } from "@repo/ui/components/failed-count";
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
  { header: "Failed", align: "right", width: "4rem", render: (j) => <FailedCount count={j.failed} /> },
];

/** Work the API does after it has answered. */
export function JobsPanel({ jobs }: { jobs: JobQueueRow[] }) {
  const active = jobs.reduce((sum, j) => sum + j.waiting + j.running, 0);
  return (
    <Panel>
      <PanelHeader title="Background jobs" description="Work the API does after it has answered." right={<PanelStat value={active} caption="Waiting or running" />} />
      <RowList columns={COLUMNS} rows={jobs} rowKey={(j) => j.name} />
    </Panel>
  );
}
