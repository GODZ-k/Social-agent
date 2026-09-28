import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { AgentRunDetail } from "@/lib/types";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { signozTraceUrl } from "./signoz";
import { RunAgainButton } from "./run-again-button";

const STATUS_VARIANT = { ok: "success", error: "danger", running: "tint" } as const;
const STATUS_LABEL = { ok: "OK", error: "Failed", running: "Running" } as const;

/** The run's name, status, why it started, and the trace and rerun the admin needs to act on it. */
export function RunHeader({ run }: { run: AgentRunDetail }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <Link href="/admin/observability/agents" className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Agents
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="type-title">{run.agent}</h1>
          <Badge variant={STATUS_VARIANT[run.status]}>{STATUS_LABEL[run.status]}</Badge>
        </div>
        <p className="mt-2 text-muted-foreground">
          For {run.brandName}. Started {format(parseISO(run.startedAt), "d MMM, h:mm a")} because {run.trigger.toLowerCase()}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button asChild variant="outline">
          <a href={signozTraceUrl(run.traceId)} target="_blank" rel="noreferrer">
            View trace in SigNoz <ExternalLink />
          </a>
        </Button>
        <RunAgainButton runId={run.id} />
      </div>
    </div>
  );
}
