import { AlertCircle, Check, Clock, Mail } from "lucide-react";
import { differenceInCalendarDays, parseISO } from "date-fns";
import type { AdminClientRow } from "@/lib/types";
import { Badge } from "@repo/ui/components/badge";
import { PLATFORM_LABEL } from "@repo/ui/components/social/platform";
import { failedRunLabel } from "@/modules/admin/utils/format";

/** What this one client needs from the admin, or that nothing does. */
export function ClientNeedsCell({ client }: { client: AdminClientRow }) {
  if (client.status === "invited" && !client.needsYou) {
    const days = client.invitedAt ? differenceInCalendarDays(new Date(), parseISO(client.invitedAt)) : 0;
    return (
      <Badge variant="neutral">
        <Mail /> Invite not opened, {days} {days === 1 ? "day" : "days"}
      </Badge>
    );
  }
  if (!client.needsYou) {
    return (
      <span className="flex items-center gap-1.5 text-success">
        <Check className="size-3.5" /> Nothing waiting
      </span>
    );
  }
  const failedLabels = [...new Set(client.failedRuns.map((r) => failedRunLabel(r.kind)))];
  return (
    <div className="flex flex-wrap gap-1.5">
      {client.postsToApprove > 0 && (
        <Badge variant="warning">
          <Clock /> {client.postsToApprove} posts to approve
        </Badge>
      )}
      {client.expiredConnections.length > 0 && (
        <Badge variant="warning">
          <AlertCircle /> {PLATFORM_LABEL[client.expiredConnections[0]!.platform]} access expired
        </Badge>
      )}
      {failedLabels.length > 0 && (
        <Badge variant="danger">
          <AlertCircle /> {failedLabels.join(", ")}
        </Badge>
      )}
    </div>
  );
}
