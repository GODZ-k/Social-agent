"use client";

import { useMemo, useState } from "react";
import type { RunKind } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { Segmented } from "@repo/ui/components/segmented";
import { StackedBars } from "./stacked-bars";

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
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="type-heading">Runs and errors</h2>
          <p className="type-label mt-1">How often each {singular} ran, and how often it failed.</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="type-number text-xl">{total}</p>
          <p className="type-label mt-0.5">Total runs</p>
        </div>
      </div>
      <Segmented label="Kind" value={kind} onValueChange={setKind} options={KIND_OPTIONS} className="mb-4" />
      {filtered.length === 0 ? (
        <p className="text-muted-foreground">Nothing of this kind ran in the window.</p>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap gap-4 text-[0.8125rem]">
            <span className="flex items-center gap-1.5">
              <i aria-hidden className="inline-block size-2 rounded-full" style={{ background: "var(--brand)" }} />
              Completed
            </span>
            <span className="flex items-center gap-1.5">
              <i aria-hidden className="inline-block size-2 rounded-full bg-destructive" />
              Errors
            </span>
          </div>
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
