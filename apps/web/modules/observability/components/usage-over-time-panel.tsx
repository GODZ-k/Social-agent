"use client";

import { useState } from "react";
import { Segmented } from "@repo/ui/components/segmented";
import { HourlyPanel } from "./hourly-panel";
import { formatTokens, formatUsd } from "@/modules/observability/utils/format";

type Metric = "tokens" | "cost";

/** Input and output tokens per hour, or AI cost per hour, behind a toggle. */
export function UsageOverTimePanel({
  tokensHourly,
  costHourly,
}: {
  tokensHourly: { at: string; input: number; output: number }[];
  costHourly: { at: string; cost: number }[];
}) {
  const [metric, setMetric] = useState<Metric>("tokens");
  const toolbar = (
    <Segmented
      label="Metric"
      value={metric}
      onValueChange={setMetric}
      options={[
        { value: "tokens", label: "Tokens" },
        { value: "cost", label: "Cost" },
      ]}
    />
  );

  if (metric === "cost") {
    const total = costHourly.reduce((sum, h) => sum + h.cost, 0);
    return (
      <HourlyPanel
        title="Usage over time"
        description="AI cost per hour."
        total={formatUsd(total)}
        caption="Total cost"
        rows={costHourly.map((h) => ({ at: h.at, primary: h.cost }))}
        primaryLabel="Cost"
        formatValue={formatUsd}
        toolbar={toolbar}
      />
    );
  }

  const totalInput = tokensHourly.reduce((sum, h) => sum + h.input, 0);
  const totalOutput = tokensHourly.reduce((sum, h) => sum + h.output, 0);
  return (
    <HourlyPanel
      title="Usage over time"
      description="Input and output tokens per hour."
      total={formatTokens(totalInput + totalOutput)}
      caption="Total tokens"
      rows={tokensHourly.map((h) => ({ at: h.at, primary: h.input, secondary: h.output }))}
      primaryLabel={`Input ${formatTokens(totalInput)}`}
      secondaryLabel={`Output ${formatTokens(totalOutput)}`}
      formatValue={formatTokens}
      toolbar={toolbar}
    />
  );
}
