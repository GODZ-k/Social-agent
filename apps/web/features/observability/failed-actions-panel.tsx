import type { FailedActionRow } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { RowList, type RowListColumn } from "./row-list";

const COLUMNS: RowListColumn<FailedActionRow>[] = [
  {
    header: "Action and most common reason",
    main: true,
    render: (a) => (
      <span className="min-w-0">
        <span className="block font-medium">{a.action}</span>
        <span className="type-label block">{a.reason ?? "No failures"}</span>
      </span>
    ),
  },
  { header: "Tried", align: "right", render: (a) => a.tried },
  { header: "Failed", align: "right", render: (a) => <span className={a.failed > 0 ? "font-medium text-destructive" : ""}>{a.failed}</span> },
  {
    header: "Failure rate",
    align: "right",
    render: (a) => {
      const rate = Math.round((a.failed / a.tried) * 100);
      return (
        <span className="flex items-center gap-2">
          <span className="tabular-nums">{rate}%</span>
          <span className="h-1.5 w-10 shrink-0 overflow-hidden rounded-full bg-secondary">
            <span className="block h-full rounded-full bg-destructive" style={{ width: `${rate}%` }} />
          </span>
        </span>
      );
    },
  },
];

/** Things people tried to do that did not work, worst rate first. */
export function FailedActionsPanel({ actions }: { actions: FailedActionRow[] }) {
  const total = actions.reduce((sum, a) => sum + a.failed, 0);
  const sorted = [...actions].sort((a, b) => b.failed / b.tried - a.failed / a.tried);
  return (
    <Panel>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="type-heading">Failed actions</h2>
          <p className="type-label mt-1">Things people tried to do that did not work, worst rate first.</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="type-number text-xl">{total}</p>
          <p className="type-label mt-0.5">Failed</p>
        </div>
      </div>
      <RowList columns={COLUMNS} rows={sorted} rowKey={(a) => a.action} />
    </Panel>
  );
}
