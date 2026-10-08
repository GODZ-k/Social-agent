import { format, parseISO } from "date-fns";
import type { AgentRunDetail } from "@/lib/types";
import { Badge } from "@repo/ui/components/badge";
import { BackLink } from "@/components/common/back-link";
import { SignozTraceButton } from "./signoz";
import { RunAgainButton } from "./run-again-button";
import { routes } from "@/config/routes";

const STATUS_VARIANT = { ok: "success", error: "danger", running: "tint" } as const;
const STATUS_LABEL = { ok: "OK", error: "Failed", running: "Running" } as const;

/** The run's name, status, why it started, and the trace and rerun the admin needs to act on it. */
export function RunHeader({ run }: { run: AgentRunDetail }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <BackLink href={routes.admin.observability.agents} label="Agents" className="mb-2" />
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="type-title">{run.agent}</h1>
          <Badge variant={STATUS_VARIANT[run.status]}>{STATUS_LABEL[run.status]}</Badge>
        </div>
        <p className="mt-2 text-muted-foreground">
          For {run.brandName}. Started {format(parseISO(run.startedAt), "d MMM, h:mm a")} because {run.trigger.toLowerCase()}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <SignozTraceButton traceId={run.traceId} label="View trace in SigNoz" />
        <RunAgainButton runId={run.id} />
      </div>
    </div>
  );
}
