"use client";

import { useState } from "react";
import { Panel } from "@repo/ui/components/states";
import { Segmented } from "@repo/ui/components/segmented";
import { StackedBars } from "./stacked-bars";
import { formatTokens, formatUsd } from "./format";

type Metric = "tokens" | "cost";

/** Which agents use the most: tokens or cost, ranked highest first, input and output stacked per bar. */
export function UsageByAgentPanel({ byAgent }: { byAgent: { agent: string; input: number; output: number; cost: number }[] }) {
  const [metric, setMetric] = useState<Metric>("tokens");
  const totalTokens = byAgent.reduce((sum, a) => sum + a.input + a.output, 0);
  const totalCost = byAgent.reduce((sum, a) => sum + a.cost, 0);

  return (
    <Panel>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="type-heading">Usage by agent</h2>
          <p className="type-label mt-1">Which agents use the most.</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="type-number text-xl">{metric === "tokens" ? formatTokens(totalTokens) : formatUsd(totalCost)}</p>
          <p className="type-label mt-0.5">{metric === "tokens" ? "Total tokens" : "Total cost"}</p>
        </div>
      </div>
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
        <div className="mb-3 flex flex-wrap gap-4 text-[0.8125rem]">
          <span className="flex items-center gap-1.5">
            <i aria-hidden className="inline-block size-2 rounded-full" style={{ background: "var(--brand)" }} />
            Input
          </span>
          <span className="flex items-center gap-1.5">
            <i aria-hidden className="inline-block size-2 rounded-full" style={{ background: "color-mix(in srgb, var(--brand) 42%, var(--card))" }} />
            Output
          </span>
        </div>
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
