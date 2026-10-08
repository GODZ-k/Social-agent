import { ExternalLink } from "lucide-react";
import { Button } from "@repo/ui/components/button";

/** SigNoz base URL: an env var so each environment points at its own instance. */
const SIGNOZ_BASE = (process.env.NEXT_PUBLIC_SIGNOZ_URL || "https://signoz.thescaleagency.dev").replace(/\/$/, "");

export const signozTraceUrl = (traceId: string) => `${SIGNOZ_BASE}/trace/${traceId}`;

export const signozLogsUrl = () => `${SIGNOZ_BASE}/logs`;

/** A route's requests in SigNoz, filtered by its path. */
export const signozRequestsUrl = (path: string) => `${SIGNOZ_BASE}/logs?path=${encodeURIComponent(path)}`;

/** A trace link to SigNoz, wherever a row or panel needs one. */
export function SignozTraceLink({ traceId, label = "Trace" }: { traceId: string; label?: string }) {
  return (
    <a
      href={signozTraceUrl(traceId)}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-sm font-medium text-tint-foreground hover:underline"
    >
      {label}
      <ExternalLink className="size-3.5" />
    </a>
  );
}

/** The outlined "open this trace in SigNoz" button on a detail page's header. */
export function SignozTraceButton({ traceId, label }: { traceId: string; label: string }) {
  return (
    <Button asChild variant="outline">
      <a href={signozTraceUrl(traceId)} target="_blank" rel="noreferrer">
        {label} <ExternalLink />
      </a>
    </Button>
  );
}
