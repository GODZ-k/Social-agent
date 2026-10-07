import Link from "next/link";
import { parseISO, format } from "date-fns";
import { AlertTriangle, Calendar, PencilLine, Sparkles } from "lucide-react";
import type { PostView } from "@/lib/types";
import { workspaceHref, type WorkspaceBasePath } from "@/lib/workspace-path";
import { cn } from "@/lib/utils";
import { Button } from "@repo/ui/components/button";
import { PLATFORM_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";
import { platformNames, waitingPlatforms } from "@/components/calendar/calendar-model";

function Row({
  icon,
  tone,
  title,
  detail,
  action,
}: {
  icon: React.ReactNode;
  tone: string;
  title: string;
  detail?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-3.5 border-t border-border py-3.5 first:border-t-0">
      <span className={cn("grid size-9 place-items-center rounded-full [&_svg]:size-4", tone)}>{icon}</span>
      <div className="min-w-0">
        <p className="font-semibold">{title}</p>
        {detail && <p className="mt-0.5 text-sm text-muted-foreground">{detail}</p>}
        {action && <div className="mt-2.5">{action}</div>}
      </div>
    </div>
  );
}

/**
 * S09 ST-4 (done): what just happened, decision by decision, so the owner knows what to check
 * next without opening Content or the calendar. Up to four rows; each shows only when it applies.
 */
export function WhatHappensNext({
  approved,
  changesCount,
  brandId,
  basePath = "/c",
}: {
  /** Every post approved this session, so the calendar row and the connection warning read from real outcomes. */
  approved: PostView[];
  changesCount: number;
  brandId: string;
  basePath?: WorkspaceBasePath;
}) {
  const scheduled = approved.filter((p) => p.scheduledFor).sort((a, b) => a.scheduledFor!.localeCompare(b.scheduledFor!));
  const firstGoesOut = scheduled[0]?.scheduledFor ? parseISO(scheduled[0].scheduledFor) : null;
  const firstSubject = approved.length === 1 ? "It" : "The first";
  const calendarDetail = firstGoesOut
    ? `${firstSubject} goes out ${format(firstGoesOut, "EEEE d MMMM")} at ${format(firstGoesOut, "h:mm a")}.`
    : undefined;
  const waiting = waitingPlatforms(approved);

  return (
    <div className="mx-auto mt-8 max-w-lg text-left">
      <p className="px-1 text-[0.8125rem] text-muted-foreground">What happens next</p>
      <div className="mt-2">
        {approved.length > 0 && (
          <Row
            icon={<Calendar />}
            tone="bg-success/10 text-success"
            title={`${approved.length} ${approved.length === 1 ? "post is" : "posts are"} on the calendar.`}
            detail={calendarDetail}
          />
        )}
        {waiting.length > 0 && (
          <Row
            icon={<AlertTriangle />}
            tone="bg-warning/10 text-warning"
            title={`${platformNames(waiting)} ${waiting.length === 1 ? "isn't" : "aren't"} connected yet.`}
            detail={`Approved posts wait and go out as soon as you connect ${waiting.length === 1 ? "it" : "them"}.`}
            action={
              <Button size="sm" variant="outline" asChild>
                <Link href={workspaceHref(basePath, brandId, "/settings?tab=accounts")}>
                  {waiting.length === 1 ? (
                    <>
                      <PlatformIcon platform={waiting[0]!} />
                      Connect {PLATFORM_LABEL[waiting[0]!]}
                    </>
                  ) : (
                    "Connect accounts"
                  )}
                </Link>
              </Button>
            }
          />
        )}
        {changesCount > 0 && (
          <Row
            icon={<PencilLine />}
            tone="bg-tint text-tint-foreground"
            title={`${changesCount} ${changesCount === 1 ? "post is" : "posts are"} back with the agent.`}
            detail={changesCount === 1 ? "It comes back here once it's rewritten." : "They come back here once they're rewritten."}
          />
        )}
        <Row
          icon={<Sparkles />}
          tone="bg-tint text-tint-foreground"
          title="New drafts arrive about a week ahead."
          detail="They show up here before anything is scheduled."
        />
      </div>
    </div>
  );
}
