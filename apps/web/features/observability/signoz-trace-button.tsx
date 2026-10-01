import { ExternalLink } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { signozTraceUrl } from "./signoz";

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
