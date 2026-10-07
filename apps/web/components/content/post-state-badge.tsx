import { CalendarClock, CircleCheckBig, Clock, Hourglass, PencilLine, TriangleAlert, X, type LucideIcon } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { PLATFORM_LABEL } from "@repo/ui/components/social/platform";
import { cn } from "@/lib/utils";
import type { PostState, PostView } from "@/lib/types";

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

const STATE_META: Record<Exclude<PostState, "waiting_for_connection">, { label: string; variant: BadgeVariant; icon: LucideIcon }> = {
  draft: { label: "Draft", variant: "neutral", icon: PencilLine },
  needs_approval: { label: "Needs approval", variant: "warning", icon: Clock },
  scheduled: { label: "Scheduled", variant: "tint", icon: CalendarClock },
  published: { label: "Published", variant: "success", icon: CircleCheckBig },
  failed: { label: "Failed", variant: "danger", icon: TriangleAlert },
  rejected: { label: "Rejected", variant: "danger", icon: X },
};

/**
 * Colour is never the only signal: every state also has its own icon and words.
 * `waiting_for_connection` reads as waiting, not failed: the post publishes once the account is connected.
 */
export function PostStateBadge({ post, className }: { post: PostView; className?: string }) {
  if (post.state === "waiting_for_connection") {
    return (
      <Badge variant="neutral" className={className}>
        <Hourglass /> Approved, waiting for {PLATFORM_LABEL[post.platform]}
      </Badge>
    );
  }
  const { label, variant, icon: Icon } = STATE_META[post.state];
  return (
    <Badge variant={variant} className={className}>
      <Icon /> {label}
    </Badge>
  );
}

const STATE_TEXT_COLOR: Record<Exclude<PostState, "waiting_for_connection">, string> = {
  draft: "text-muted-foreground",
  needs_approval: "text-warning",
  scheduled: "text-tint-foreground",
  published: "text-success",
  failed: "text-destructive",
  rejected: "text-destructive",
};

/** "Needs approval" / "Waiting for Instagram", plain coloured text: the calendar month grid's compact status line. */
export function PostStateText({ post, className }: { post: PostView; className?: string }) {
  const label = post.state === "waiting_for_connection" ? `Waiting for ${PLATFORM_LABEL[post.platform]}` : STATE_META[post.state].label;
  const color = post.state === "waiting_for_connection" ? "text-tint-foreground" : STATE_TEXT_COLOR[post.state];
  return <span className={cn("truncate font-semibold", color, className)}>{label}</span>;
}
