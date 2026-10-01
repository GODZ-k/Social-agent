"use client";

import { useMemo, useState } from "react";
import type { RunKind } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { Segmented } from "@repo/ui/components/segmented";
import { StackedBars } from "./stacked-bars";
import { PanelHeader } from "@repo/ui/components/panel-header";
import { PanelStat } from "@repo/ui/components/panel-stat";
import { ChartLegend } from "@repo/ui/components/chart-legend";

const KIND_OPTIONS: { value: RunKind; label: string; singular: string }[] = [
  { value: "agent", label: "Agents", singular: "agent" },
  { value: "workflow", label: "Workflows", singular: "workflow" },
  { value: "tool", label: "Tools", singular: "tool" },
];

/** How often each agent, workflow or tool ran, and how often it failed: a stacked bar per row, errors in red. */
export function RunsByKindPanel({ rows }: { rows: { name: string; kind: RunKind; completed: number; errors: number }[] }) {
  const [kind, setKind] = useState<RunKind>("agent");
  const filtered = useMemo(() => rows.filter((r) => r.kind === kind), [rows, kind]);
  const total = filtered.reduce((sum, r) => sum + r.completed + r.errors, 0);
  const singular = KIND_OPTIONS.find((o) => o.value === kind)!.singular;

  return (
    <Panel>
      <PanelHeader
        title="Runs and errors"
        description={`How often each ${singular} ran, and how often it failed.`}
        right={<PanelStat value={total} caption="Total runs" />}
      />
      <Segmented label="Kind" value={kind} onValueChange={setKind} options={KIND_OPTIONS} className="mb-4" />
      {filtered.length === 0 ? (
        <p className="text-muted-foreground">Nothing of this kind ran in the window.</p>
      ) : (
        <>
          <ChartLegend className="mb-3" items={[{ label: "Completed", color: "var(--brand)" }, { label: "Errors", swatchClassName: "bg-destructive" }]} />
          <StackedBars
            rows={filtered.map((r) => ({
              key: r.name,
              label: r.name,
              segments: [
                { value: r.completed, color: "var(--brand)" },
                { value: r.errors, color: "var(--destructive)" },
              ],
            }))}
            formatValue={(n) => `${n}`}
          />
        </>
      )}
    </Panel>
  );
}
