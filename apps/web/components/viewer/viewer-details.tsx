"use client";

import { format } from "date-fns";
import { Check, Pencil, X } from "lucide-react";
import { reschedulePost } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { PostView, Strategy } from "@/lib/types";
import { Button } from "@repo/ui/components/button";
import { relativeDayLabel } from "@/components/content/format-post";
import { bestTimesOnDay } from "@/components/post/best-times-on-day";
import { NotConnectedNote } from "@/components/post/not-connected-note";
import { PostCaptionHashtags } from "@/components/post/post-caption-hashtags";
import { PostReasonNote } from "@/components/post/post-reason-note";
import { TimeChangePills } from "@/components/post/time-change-pills";

interface Props {
  post: PostView;
  strategy: Strategy | null;
  connected: boolean;
  onApprove: () => void;
  onReject: () => void;
  onAsk: () => void;
}

const kbd = "inline-grid size-6 min-w-6 place-items-center rounded-md border bg-card text-[0.72rem] font-semibold text-muted-foreground";

/**
 * The decision panel (S10): a light card on the dark stage, so the post reads as the
 * post and the panel as the tool. Full below `lg` (the detail folds away, only the
 * short caption and the decision stay), a scrollable detail plus a docked footer at `lg`+.
 */
export function ViewerDetails({ post, strategy, connected, onApprove, onReject, onAsk }: Props) {
  const reschedule = useServerAction(reschedulePost, { failure: "Couldn't change the time." });
  const when = post.scheduledFor ? new Date(post.scheduledFor) : null;
  const currentTime = when ? format(when, "HH:mm") : "";
  const times = when ? bestTimesOnDay(strategy, post.platform, when).map((slot) => slot.time) : [];

  function changeTime(time: string) {
    if (!when) return;
    const next = new Date(when);
    const [hours, minutes] = time.split(":").map(Number);
    next.setHours(hours!, minutes!, 0, 0);
    reschedule.run(post.id, next.toISOString());
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* The full detail: only room for it once the panel is a side column, not a bottom dock. */}
      <div className="hidden min-h-0 flex-1 content-start gap-4 overflow-y-auto p-6 lg:grid">
        {when && (
          <div className="grid gap-1.5 rounded-2xl bg-secondary p-3.5">
            <p className="type-label">Goes out</p>
            <p className="font-display text-[1.25rem] font-semibold tracking-tight tabular-nums">{format(when, "EEEE d MMMM, h:mm a")}</p>
            <p className="type-label">{relativeDayLabel(when)}</p>
            <TimeChangePills times={times} currentTime={currentTime} onChange={changeTime} disabled={reschedule.isPending} />
          </div>
        )}
        <PostCaptionHashtags post={post} />
        <PostReasonNote note={post.aiNote} />
      </div>

      <div className="grid gap-2.5 p-4 pt-3.5 lg:border-t lg:p-6 lg:pt-4">
        <p className="line-clamp-2 text-sm leading-snug lg:hidden">{post.caption}</p>
        {!connected && <NotConnectedNote platform={post.platform} />}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1.3fr_1fr] lg:grid-cols-2">
          <Button
            variant="outline"
            className="col-start-1 row-start-1 text-destructive sm:col-start-1 sm:row-start-1 sm:px-3 lg:col-start-2 lg:row-start-2 lg:px-6"
            onClick={onReject}
          >
            <X /> Reject
          </Button>
          <Button
            variant="outline"
            className="col-span-2 row-start-2 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:px-3 lg:col-span-1 lg:col-start-1 lg:row-start-2 lg:px-6"
            onClick={onAsk}
          >
            <Pencil /> Ask for changes
          </Button>
          <Button
            className="col-start-2 row-start-1 bg-success text-white hover:brightness-105 sm:col-start-3 sm:row-start-1 sm:px-3 lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:px-6"
            onClick={onApprove}
          >
            <Check /> Approve
          </Button>
        </div>

        <p className="hidden items-center justify-center gap-1.5 text-center text-xs text-muted-foreground lg:flex">
          <kbd className={kbd}>A</kbd> approve <kbd className={kbd}>E</kbd> ask for changes <kbd className={kbd}>R</kbd> reject
        </p>
      </div>
    </div>
  );
}
