import { CalendarClock, Check, CircleCheckBig, Clock, Hourglass, PencilLine, X, type LucideIcon } from "lucide-react";
import type { Platform, PostStatus } from "./types";
import { PLATFORM_LABEL } from "./platform-names";
import { Badge } from "../badge";

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

/** Colour is never the only signal: every status also has its own icon and words. */
export const POST_STATUS: Record<PostStatus, { label: string; variant: BadgeVariant; icon: LucideIcon }> = {
  draft: { label: "Draft", variant: "neutral", icon: PencilLine },
  in_review: { label: "Needs approval", variant: "warning", icon: Clock },
  approved: { label: "Approved", variant: "success", icon: Check },
  scheduled: { label: "Scheduled", variant: "tint", icon: CalendarClock },
  published: { label: "Published", variant: "success", icon: CircleCheckBig },
  rejected: { label: "Rejected", variant: "danger", icon: X },
};

export function StatusBadge({ status, className }: { status: PostStatus; className?: string }) {
  const { label, variant, icon: Icon } = POST_STATUS[status];
  return (
    <Badge variant={variant} className={className}>
      <Icon aria-hidden />
      {label}
    </Badge>
  );
}

/**
 * An approved post whose account is not connected yet. Not an error: it
 * publishes once the account is connected, so it reads as waiting, not failed.
 */
export function WaitingForAccountBadge({ platform, className }: { platform: Platform; className?: string }) {
  return (
    <Badge variant="neutral" className={className}>
      <Hourglass aria-hidden />
      Approved, waiting for {PLATFORM_LABEL[platform]}
    </Badge>
  );
}
