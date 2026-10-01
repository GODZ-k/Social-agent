import type { FailedActionRow } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { RowList, type RowListColumn } from "./row-list";
import { PanelHeader } from "@repo/ui/components/panel-header";
import { PanelStat } from "@repo/ui/components/panel-stat";
import { FailedCount } from "@repo/ui/components/failed-count";
import { RateBar } from "@repo/ui/components/rate-bar";

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
  { header: "Failed", align: "right", render: (a) => <FailedCount count={a.failed} /> },
  { header: "Failure rate", align: "right", render: (a) => <RateBar pct={Math.round((a.failed / a.tried) * 100)} /> },
];

/** Things people tried to do that did not work, worst rate first. */
export function FailedActionsPanel({ actions }: { actions: FailedActionRow[] }) {
  const total = actions.reduce((sum, a) => sum + a.failed, 0);
  const sorted = [...actions].sort((a, b) => b.failed / b.tried - a.failed / a.tried);
  return (
    <Panel>
      <PanelHeader
        title="Failed actions"
        description="Things people tried to do that did not work, worst rate first."
        right={<PanelStat value={total} caption="Failed" />}
      />
      <RowList columns={COLUMNS} rows={sorted} rowKey={(a) => a.action} />
    </Panel>
  );
}
