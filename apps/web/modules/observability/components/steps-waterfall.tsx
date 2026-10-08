import { Bot, Check, Workflow, Wrench, X } from "lucide-react";
import type { RunStep } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { Badge } from "@repo/ui/components/badge";
import { cn } from "@/lib/utils";
import { PanelHeader } from "@repo/ui/components/panel-header";
import { formatMs, formatUsd } from "@/modules/observability/utils/format";

const KIND_ICON = { step: Workflow, agent: Bot, tool: Wrench } as const;
const KIND_LABEL = { step: "Step", agent: "Agent", tool: "Tool" } as const;

/** What the run did, in order. A bar for each step shows when it ran, relative to the whole run. */
export function StepsWaterfall({ steps, totalMs }: { steps: RunStep[]; totalMs: number }) {
  return (
    <Panel>
      <PanelHeader title="Steps" description="What the run did, in order. Bars show when each step ran." />
      <div className="grid gap-1">
        {steps.map((step) => {
          const Icon = KIND_ICON[step.type];
          const left = totalMs > 0 ? (step.startMs / totalMs) * 100 : 0;
          const width = totalMs > 0 ? Math.max((step.durationMs / totalMs) * 100, 1) : 0;
          return (
            <div key={step.id} className={cn("grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg px-2 py-2", step.status === "failed" && "bg-destructive/6")}>
              <div className="flex min-w-0 items-center gap-2.5">
                <span className={cn("grid size-6 shrink-0 place-items-center rounded-full", step.status === "failed" ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success")}>
                  {step.status === "failed" ? <X className="size-3.5" /> : <Check className="size-3.5" />}
                </span>
                <span className="truncate font-medium">{step.name}</span>
                <Badge variant="neutral" className="shrink-0">
                  <Icon className="size-3" />
                  {KIND_LABEL[step.type]}
                </Badge>
                <div className="relative hidden h-1.5 min-w-16 flex-1 rounded-full bg-secondary sm:block">
                  <span
                    className={cn("absolute inset-y-0 rounded-full", step.status === "failed" ? "bg-destructive" : "bg-primary")}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                </div>
              </div>
              <span className="type-label tabular-nums">{formatMs(step.durationMs)}</span>
              <span className="type-label tabular-nums">{step.cost > 0 ? formatUsd(step.cost) : ""}</span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
