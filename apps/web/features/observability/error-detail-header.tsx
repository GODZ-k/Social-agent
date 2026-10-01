import type { FrontendErrorDetail } from "@/lib/types";
import { Badge } from "@repo/ui/components/badge";
import { BackLink } from "./back-link";
import { SignozTraceButton } from "./signoz-trace-button";
import { MarkAsFixedButton } from "./mark-as-fixed-button";

/** What broke, for whom, and the two actions: open the trace, or mark it fixed. */
export function ErrorDetailHeader({ error }: { error: FrontendErrorDetail }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <BackLink href="/admin/observability/frontend" label="Frontend" />
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <Badge variant={error.status === "fixed" ? "success" : "danger"}>{error.status === "fixed" ? "Fixed" : "Unresolved"}</Badge>
          {error.newInRelease && <Badge variant="tint">New in this release</Badge>}
        </div>
        <h1 className="break-words font-mono text-xl leading-snug font-semibold">{error.message}</h1>
        <p className="mt-2 text-muted-foreground">{error.effect}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <SignozTraceButton traceId={error.traceId} label="Open in SigNoz" />
        <MarkAsFixedButton errorId={error.id} alreadyFixed={error.status === "fixed"} />
      </div>
    </div>
  );
}
