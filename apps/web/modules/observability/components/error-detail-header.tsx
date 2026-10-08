import type { FrontendErrorDetail } from "@/lib/types";
import { Badge } from "@repo/ui/components/badge";
import { BackLink } from "@/components/common/back-link";
import { SignozTraceButton } from "./signoz";
import { MarkAsFixedButton } from "./mark-as-fixed-button";
import { routes } from "@/config/routes";

/** What broke, for whom, and the two actions: open the trace, or mark it fixed. */
export function ErrorDetailHeader({ error }: { error: FrontendErrorDetail }) {
  const fixed = error.status === "fixed";

  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <BackLink href={routes.admin.observability.frontend} label="Frontend" className="mb-2" />
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <Badge variant={fixed ? "success" : "danger"}>{fixed ? "Fixed" : "Unresolved"}</Badge>
          {error.newInRelease && <Badge variant="tint">New in this release</Badge>}
        </div>
        <h1 className="break-words font-mono text-xl leading-snug font-semibold">{error.message}</h1>
        <p className="mt-2 text-muted-foreground">{error.effect}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <SignozTraceButton traceId={error.traceId} label="Open in SigNoz" />
        <MarkAsFixedButton errorId={error.id} alreadyFixed={fixed} />
      </div>
    </div>
  );
}
