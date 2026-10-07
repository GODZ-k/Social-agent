"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Check, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { toast } from "sonner";
import { approvePost, askForPostChanges, rejectPost, undoPostDecision } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { BrandKit } from "@social-agent/shared";
import type { BestTimeSlot, PostView } from "@/lib/types";
import { Sheet } from "@repo/ui/components/sheet";
import { Button } from "@repo/ui/components/button";
import { PLATFORM_LABEL } from "@repo/ui/components/social/platform";
import { PostFacts } from "@repo/ui/components/social/post-facts";
import { StatusBadge, WaitingForAccountBadge } from "@repo/ui/components/social/status-badge";
import { AskForChangesDialog } from "./ask-for-changes-dialog";
import { NotConnectedNote } from "./not-connected-note";
import { PostReasonNote } from "./post-reason-note";
import { ReviewPostCaptionHashtags } from "./review-post-caption-hashtags";
import { ReviewPostPreview } from "./review-post-preview";
import { ReviewPostSchedule } from "./review-post-schedule";

interface Props {
  post: PostView;
  brand: BrandKit;
  bestTimes: BestTimeSlot[];
  connected: boolean;
  position: number | null;
  total: number;
  prevId: string | null;
  nextId: string | null;
}

/** The exit animation gets a moment to play before the `?post=` param actually leaves. */
const CLOSE_DELAY = 250;

export function ReviewPostPanel({ post, brand, bestTimes, connected, position, total, prevId, nextId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [asking, setAsking] = useState(false);

  function close(delay = 0) {
    setOpen(false);
    setTimeout(() => router.push(pathname), delay);
  }
  function step(id: string | null) {
    if (id) router.push(`${pathname}?post=${id}`);
  }
  function after(nextPostId: string | null) {
    if (nextPostId) step(nextPostId);
    else close();
  }

  const undo = useServerAction(undoPostDecision);
  const approve = useServerAction(approvePost, {
    onSuccess: (result) => {
      const waits = result.post.state === "waiting_for_connection";
      toast(waits ? `Approved. It waits for ${PLATFORM_LABEL[result.post.platform]}.` : "Approved and scheduled.", {
        action: { label: "Undo", onClick: () => undo.run(post.id) },
      });
      after(result.nextPostId);
    },
  });
  const reject = useServerAction(rejectPost, {
    onSuccess: (result) => {
      toast("Rejected.", { action: { label: "Undo", onClick: () => undo.run(post.id) } });
      after(result.nextPostId);
    },
  });
  const askChanges = useServerAction(askForPostChanges, {
    onSuccess: (result) => {
      setAsking(false);
      toast("Sent to the agent. It comes back for another look.", { action: { label: "Undo", onClick: () => undo.run(post.id) } });
      after(result.nextPostId);
    },
  });

  const pending = approve.isPending || reject.isPending || askChanges.isPending;
  const when = post.scheduledFor ? format(new Date(post.scheduledFor), "EEE d MMM, h:mm a") : "No time set";

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(next) => !next && close(CLOSE_DELAY)}
        title="Review post"
        description={position ? `${position} of ${total} waiting for you` : undefined}
        className="max-[560px]:inset-0 max-[560px]:max-h-none max-[560px]:rounded-none max-[560px]:[&>div:first-child]:hidden md:w-[min(32rem,calc(100vw-1.5rem))]"
        headerActions={
          <>
            <button
              type="button"
              aria-label="Previous post"
              disabled={!prevId}
              onClick={() => step(prevId)}
              className="pressable grid size-8 place-items-center rounded-full bg-secondary text-muted-foreground disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next post"
              disabled={!nextId}
              onClick={() => step(nextId)}
              className="pressable grid size-8 place-items-center rounded-full bg-secondary text-muted-foreground disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        }
        footer={
          <div className="grid w-full grid-cols-2 gap-2.5 sm:flex sm:items-center">
            <Button
              type="button"
              variant="ghost"
              className="order-2 text-destructive sm:order-1 sm:mr-auto"
              disabled={pending}
              onClick={() => reject.run(post.id)}
            >
              Reject
            </Button>
            <Button type="button" variant="outline" className="order-3 sm:order-2" disabled={pending} onClick={() => setAsking(true)}>
              <Pencil /> Ask for changes
            </Button>
            <Button
              type="button"
              className="order-1 col-span-2 bg-success text-white hover:brightness-105 sm:order-3 sm:col-auto"
              disabled={pending}
              onClick={() => approve.run(post.id)}
            >
              <Check /> Approve, next post
            </Button>
          </div>
        }
      >
        <div className="grid gap-4.5">
          <PostFacts platform={post.platform} format={post.format} slides={post.slides} durationSec={post.durationSec} date={when} dateHref="#when">
            {post.state === "waiting_for_connection" ? (
              <WaitingForAccountBadge platform={post.platform} />
            ) : (
              <StatusBadge status={post.status} />
            )}
          </PostFacts>

          <ReviewPostPreview post={post} brand={brand} />
          <PostReasonNote note={post.aiNote} />

          <ReviewPostCaptionHashtags post={post} />

          <ReviewPostSchedule postId={post.id} scheduledFor={post.scheduledFor} bestTimes={bestTimes} />

          {!connected && <NotConnectedNote platform={post.platform} />}
        </div>
      </Sheet>

      <AskForChangesDialog
        open={asking}
        onOpenChange={setAsking}
        pending={askChanges.isPending}
        onSend={(note) => askChanges.run(post.id, note)}
      />
    </>
  );
}
