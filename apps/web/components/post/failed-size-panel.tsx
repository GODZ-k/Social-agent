"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { addMinutes, format, parseISO } from "date-fns";
import { Pencil, RefreshCw } from "lucide-react";
import { reschedulePost } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { BrandKit } from "@social-agent/shared";
import type { PostView } from "@/lib/types";
import { Sheet } from "@repo/ui/components/sheet";
import { Button } from "@repo/ui/components/button";
import { PostFacts } from "@repo/ui/components/social/post-facts";
import { PLATFORM_LABEL } from "@repo/ui/components/social/platform";
import { PostStateBadge } from "./post-state-badge";
import { FailAlert } from "./fail-alert";
import { ReviewPostCaptionHashtags } from "./review-post-caption-hashtags";
import { ReviewPostPreview } from "./review-post-preview";
import { WhenItGoesOutChoice } from "./when-it-goes-out-choice";

const CLOSE_DELAY = 250;

/**
 * FL-2, state 1: the network refused the post itself (too long, too tall, the wrong shape). The
 * fix is to change the post, not the connection, so the caption editor from the review panel
 * stays open here — "Try again" retries as-is, "Change and try again" is for after you've edited it.
 */
export function FailedSizePanel({ post, brand }: { post: PostView; brand: BrandKit }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [asapIso] = useState(() => addMinutes(new Date(), 2).toISOString());
  const [when, setWhen] = useState(asapIso);

  function close(delay = 0) {
    setOpen(false);
    setTimeout(() => router.push(pathname), delay);
  }

  const retry = useServerAction(reschedulePost, {
    onSuccess: () => close(),
    success: "Fixed. It goes back on the schedule.",
    failure: "Couldn't retry that.",
  });

  const due = post.scheduledFor ? format(parseISO(post.scheduledFor), "EEE d MMM, h:mm a") : "No time set";

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => !next && close(CLOSE_DELAY)}
      title="Post didn’t go out"
      description="Fix it and it goes out straight away"
      footer={
        <>
          <Button type="button" variant="outline" className="mr-auto" disabled={retry.isPending} onClick={() => retry.run(post.id, when)}>
            <RefreshCw /> Try again
          </Button>
          <Button type="button" disabled={retry.isPending} onClick={() => retry.run(post.id, when)}>
            <Pencil /> Change and try again
          </Button>
        </>
      }
    >
      <div className="grid gap-4.5">
        <PostFacts platform={post.platform} format={post.format} slides={post.slides} durationSec={post.durationSec} date={`Was due ${due}`}>
          <PostStateBadge post={post} />
        </PostFacts>

        {post.failure && (
          <FailAlert heading={`${PLATFORM_LABEL[post.platform]} didn’t accept this post`} triedAt={post.failure.at}>
            {post.failure.reason} Nothing was posted, so none of your followers saw it.
          </FailAlert>
        )}

        <ReviewPostPreview post={post} brand={brand} />

        <WhenItGoesOutChoice
          title="When it goes out after the fix"
          asapLabel="As soon as it’s fixed"
          asapIso={asapIso}
          value={when}
          onChange={setWhen}
          disabled={retry.isPending}
        />

        <ReviewPostCaptionHashtags post={post} />
      </div>
    </Sheet>
  );
}
