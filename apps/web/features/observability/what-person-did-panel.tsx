import { format, parseISO } from "date-fns";
import { AlertCircle, Circle, ExternalLink, MousePointerClick, Navigation } from "lucide-react";
import type { FrontendErrorDetail } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { cn } from "@/lib/utils";
import { PanelHeader } from "@repo/ui/components/panel-header";
import { SignozTraceLink } from "./signoz-link";

const KIND_ICON = { navigation: Navigation, request: ExternalLink, click: MousePointerClick, error: AlertCircle } as const;

/** The last steps before the error, from the most recent time it happened. */
export function WhatPersonDidPanel({ steps }: { steps: FrontendErrorDetail["steps"] }) {
  return (
    <Panel>
      <PanelHeader title="What the person did" description="The last steps before the error, from the most recent time." />
      <ol className="grid gap-3">
        {steps.map((step, i) => {
          const Icon = KIND_ICON[step.kind] ?? Circle;
          return (
            <li key={i} className="flex items-start gap-3">
              <span className="type-label w-16 shrink-0 tabular-nums">{format(parseISO(step.at), "h:mm:ss a")}</span>
              <Icon className={cn("mt-0.5 size-4 shrink-0", step.kind === "error" ? "text-destructive" : "text-muted-foreground")} />
              <span className="min-w-0 break-words">
                {step.text}
                {step.status && <span className="type-label ml-1">{step.status}</span>}
                {step.traceId && (
                  <span className="ml-1.5 inline-flex align-middle">
                    <SignozTraceLink traceId={step.traceId} />
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}
