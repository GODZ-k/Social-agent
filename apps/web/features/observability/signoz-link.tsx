import { ExternalLink } from "lucide-react";
import { signozTraceUrl } from "./signoz";

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
