"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import type { AnalyticsDay } from "@/lib/types";
import { TrendChart } from "@repo/ui/components/social/charts";
import { Segmented } from "@repo/ui/components/segmented";

type Metric = "reach" | "saves" | "follows";
const METRICS: { value: Metric; label: string }[] = [
  { value: "reach", label: "People reached" },
  { value: "saves", label: "Saves" },
  { value: "follows", label: "New followers" },
];

/** The panel heading with its metric switch, and the chart for the chosen metric. */
export function DayByDayChart({ days }: { days: AnalyticsDay[] }) {
  const [metric, setMetric] = useState<Metric>("reach");
  const rows = days.map((d) => ({ label: format(parseISO(d.date), "d MMM"), value: d[metric] }));
  const metricLabel = METRICS.find((m) => m.value === metric)!.label;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="days-heading" className="type-heading">
            Day by day
          </h2>
          <p className="type-label mt-0.5">People who saw one of your posts each day.</p>
        </div>
        <Segmented label="Metric" value={metric} onValueChange={setMetric} options={METRICS} />
      </div>
      <TrendChart rows={rows} metric={metricLabel} />
    </>
  );
}
