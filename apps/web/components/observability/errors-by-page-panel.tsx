import { Panel } from "@repo/ui/components/states";
import { PanelHeader } from "@repo/ui/components/panel-header";
import { PanelStat } from "@repo/ui/components/panel-stat";
import { BarList } from "@repo/ui/components/bar-list";

/** Which pages people were on when they hit an error, by how many people: a labelled red bar per page. */
export function ErrorsByPagePanel({ rows }: { rows: { page: string; people: number }[] }) {
  return (
    <Panel>
      <PanelHeader title="Where errors happen" description="Pages, by people affected." right={<PanelStat value={rows.length} caption="Pages" />} />
      <BarList
        rows={rows}
        keyOf={(row) => row.page}
        labelOf={(row) => row.page}
        valueOf={(row) => row.people}
        formatValue={(n) => `${n}`}
        fillColor="color-mix(in srgb, var(--destructive) 55%, var(--card))"
        valueWidth="3rem"
      />
      <p className="type-label mt-4">A person can hit more than one page.</p>
    </Panel>
  );
}
