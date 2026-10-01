"use client";

import { useState } from "react";
import { Panel } from "@repo/ui/components/states";
import { Segmented } from "@repo/ui/components/segmented";
import { StackedBars } from "./stacked-bars";
import { PanelHeader } from "@repo/ui/components/panel-header";
import { PanelStat } from "@repo/ui/components/panel-stat";
import { ChartLegend } from "@repo/ui/components/chart-legend";
import { formatTokens, formatUsd } from "./format";

type Metric = "tokens" | "cost";

/** Which agents use the most: tokens or cost, ranked highest first, input and output stacked per bar. */
export function UsageByAgentPanel({ byAgent }: { byAgent: { agent: string; input: number; output: number; cost: number }[] }) {
  const [metric, setMetric] = useState<Metric>("tokens");
  const totalTokens = byAgent.reduce((sum, a) => sum + a.input + a.output, 0);
  const totalCost = byAgent.reduce((sum, a) => sum + a.cost, 0);

  return (
    <Panel>
      <PanelHeader
        title="Usage by agent"
        description="Which agents use the most."
        right={
          <PanelStat
            value={metric === "tokens" ? formatTokens(totalTokens) : formatUsd(totalCost)}
            caption={metric === "tokens" ? "Total tokens" : "Total cost"}
          />
        }
      />
      <Segmented
        label="Metric"
        value={metric}
        onValueChange={setMetric}
        options={[
          { value: "tokens", label: "Tokens" },
          { value: "cost", label: "Cost" },
        ]}
        className="mb-4"
      />
      {metric === "tokens" && (
        <ChartLegend
          className="mb-3"
          items={[
            { label: "Input", color: "var(--brand)" },
            { label: "Output", color: "color-mix(in srgb, var(--brand) 42%, var(--card))" },
          ]}
        />
      )}
      <StackedBars
        rows={byAgent.map((a) => ({
          key: a.agent,
          label: a.agent,
          segments:
            metric === "tokens"
              ? [
                  { value: a.input, color: "var(--brand)" },
                  { value: a.output, color: "color-mix(in srgb, var(--brand) 42%, var(--card))" },
                ]
              : [{ value: a.cost, color: "var(--brand)" }],
        }))}
        formatValue={metric === "tokens" ? formatTokens : formatUsd}
      />
    </Panel>
  );
}
