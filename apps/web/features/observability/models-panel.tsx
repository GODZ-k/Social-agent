import { Panel } from "@repo/ui/components/states";
import { RowList, type RowListColumn } from "./row-list";
import { PanelHeader } from "@repo/ui/components/panel-header";
import { PanelStat } from "@repo/ui/components/panel-stat";
import { formatTokens, formatUsd } from "./format";

interface Model {
  model: string;
  input: number;
  output: number;
  cached: number;
  cost: number;
}

/** A model's dot colour, by its rank in the list: brand, then a lighter tint of it, then neutral. */
const DOT_COLORS = ["var(--brand)", "color-mix(in srgb, var(--brand) 42%, var(--card))", "var(--tint-strong)"];
const dotColor = (index: number) => DOT_COLORS[index % DOT_COLORS.length]!;

function buildColumns(models: Model[]): RowListColumn<Model>[] {
  return [
    {
      header: "Model",
      main: true,
      render: (m) => (
        <span className="flex items-center gap-2 font-medium whitespace-nowrap">
          <i aria-hidden className="inline-block size-2 shrink-0 rounded-full" style={{ background: dotColor(models.indexOf(m)) }} />
          {m.model}
        </span>
      ),
    },
    { header: "Input", align: "right", render: (m) => formatTokens(m.input) },
    { header: "Output", align: "right", render: (m) => formatTokens(m.output) },
    { header: "Cached", align: "right", render: (m) => formatTokens(m.cached) },
    { header: "Cost", align: "right", render: (m) => <span className="font-medium">{formatUsd(m.cost)}</span> },
  ];
}

/** Tokens and cost for each model the agents called. */
export function ModelsPanel({ models }: { models: Model[] }) {
  const total = models.reduce((sum, m) => sum + m.cost, 0);
  return (
    <Panel>
      <PanelHeader title="Model usage and cost" description="Tokens and cost for each model." right={<PanelStat value={formatUsd(total)} caption="Total cost" />} />
      <RowList columns={buildColumns(models)} rows={models} rowKey={(m) => m.model} />
    </Panel>
  );
}
