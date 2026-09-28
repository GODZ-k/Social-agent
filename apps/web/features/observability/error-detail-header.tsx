import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { FrontendErrorDetail } from "@/lib/types";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { signozTraceUrl } from "./signoz";
import { MarkAsFixedButton } from "./mark-as-fixed-button";

/** What broke, for whom, and the two actions: open the trace, or mark it fixed. */
export function ErrorDetailHeader({ error }: { error: FrontendErrorDetail }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <Link href="/admin/observability/frontend" className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Frontend
        </Link>
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <Badge variant={error.status === "fixed" ? "success" : "danger"}>{error.status === "fixed" ? "Fixed" : "Unresolved"}</Badge>
          {error.newInRelease && <Badge variant="tint">New in this release</Badge>}
        </div>
        <h1 className="break-words font-mono text-xl leading-snug font-semibold">{error.message}</h1>
        <p className="mt-2 text-muted-foreground">{error.effect}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button asChild variant="outline">
          <a href={signozTraceUrl(error.traceId)} target="_blank" rel="noreferrer">
            Open in SigNoz <ExternalLink />
          </a>
        </Button>
        <MarkAsFixedButton errorId={error.id} alreadyFixed={error.status === "fixed"} />
      </div>
    </div>
  );
}
