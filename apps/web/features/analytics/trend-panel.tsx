"use client";

import { useState } from "react";
import { format } from "date-fns";
import type { AnalyticsPoint } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { TrendChart } from "@repo/ui/components/social/charts";
import { Segmented } from "@repo/ui/components/segmented";
import { percent } from "./percent";

type Metric = "reach" | "engagement" | "followers";
const METRICS: { value: Metric; label: string }[] = [
  { value: "reach", label: "Reach" },
  { value: "engagement", label: "Engagement" },
  { value: "followers", label: "Followers" },
];

export function TrendPanel({ series }: { series: AnalyticsPoint[] }) {
  const [metric, setMetric] = useState<Metric>("reach");
  const trend = series.map((p) => ({ label: format(new Date(p.date), "d MMM"), value: p[metric] }));

  return (
    <Panel aria-labelledby="trend-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="trend-heading" className="type-heading">Last 30 days</h2>
        <Segmented label="Metric" value={metric} onValueChange={setMetric} options={METRICS} />
      </div>
      <TrendChart
        rows={trend}
        metric={METRICS.find((m) => m.value === metric)!.label}
        formatValue={metric === "engagement" ? percent : undefined}
      />
    </Panel>
  );
}
