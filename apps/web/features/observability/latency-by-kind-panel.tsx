"use client";

import { useState } from "react";
import type { LatencyStat, RunKind } from "@/lib/types";
import { Segmented } from "@repo/ui/components/segmented";
import { HourlyPanel } from "./hourly-panel";
import { formatMs } from "./format";

const KIND_OPTIONS: { value: RunKind; label: string }[] = [
  { value: "agent", label: "Agents" },
  { value: "workflow", label: "Workflows" },
  { value: "tool", label: "Tools" },
];

/** How long a run takes, per hour, with a toggle for which kind of run. */
export function LatencyByKindPanel({ latencyByKind }: { latencyByKind: Record<RunKind, LatencyStat> }) {
  const [kind, setKind] = useState<RunKind>("agent");
  const stat = latencyByKind[kind];

  return (
    <HourlyPanel
      title="Latency"
      description="How long a run takes, per hour."
      total={formatMs(stat.p50)}
      caption="Typical run"
      rows={stat.hourly.map((h) => ({ at: h.at, primary: h.p50, secondary: h.p95 }))}
      primaryLabel={`Typical (p50) ${formatMs(stat.p50)}`}
      secondaryLabel={`Slowest 5% (p95) ${formatMs(stat.p95)}`}
      formatValue={formatMs}
      toolbar={<Segmented label="Run kind" value={kind} onValueChange={setKind} options={KIND_OPTIONS} />}
    />
  );
}
