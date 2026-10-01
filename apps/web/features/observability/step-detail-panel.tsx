"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import type { RunStep } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { Segmented } from "@repo/ui/components/segmented";
import { PanelHeader } from "@repo/ui/components/panel-header";
import { formatMs } from "./format";

const KIND_LABEL = { step: "Step", agent: "Agent", tool: "Tool" } as const;

/** The failed step, in full: its facts, the error, and what went in and came out. */
export function StepDetailPanel({ step }: { step: RunStep }) {
  const [side, setSide] = useState<"input" | "output">("input");
  const fields = side === "input" ? step.input : step.output;

  return (
    <Panel>
      <PanelHeader title={step.name} description="The failed step." />
      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="type-label">Type</p>
          <p className="mt-0.5 font-medium">{KIND_LABEL[step.type]}</p>
        </div>
        <div>
          <p className="type-label">Duration</p>
          <p className="mt-0.5 font-medium tabular-nums">{formatMs(step.durationMs)}</p>
        </div>
        <div>
          <p className="type-label">Started at</p>
          <p className="mt-0.5 font-medium tabular-nums">{formatMs(step.startMs)}</p>
        </div>
        <div>
          <p className="type-label">Tries</p>
          <p className="mt-0.5 font-medium tabular-nums">
            {step.tries.used} of {step.tries.allowed}
          </p>
        </div>
      </div>
      {step.error && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-destructive/8 p-4 text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p className="min-w-0 break-words">{step.error}</p>
        </div>
      )}
      <Segmented
        label="Input or output"
        value={side}
        onValueChange={setSide}
        options={[
          { value: "input", label: "Input" },
          { value: "output", label: "Output" },
        ]}
        className="mb-3"
      />
      <table className="w-full text-sm">
        <tbody>
          {Object.entries(fields).map(([key, value]) => (
            <tr key={key} className="border-b last:border-0">
              <td className="py-2 pr-3 text-muted-foreground">{key}</td>
              <td className="py-2 text-right font-medium">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}
