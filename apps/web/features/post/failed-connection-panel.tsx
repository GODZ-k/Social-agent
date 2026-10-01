"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { addMinutes, format, parseISO } from "date-fns";
import { Pencil } from "lucide-react";
import { connectAccount, reschedulePost } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { BrandKit } from "@social-agent/shared";
import type { PostView } from "@/lib/types";
import { Sheet } from "@repo/ui/components/sheet";
import { Button } from "@repo/ui/components/button";
import { PostFacts } from "@repo/ui/components/social/post-facts";
import { PlatformIcon, PLATFORM_LABEL } from "@repo/ui/components/social/platform";
import { PostStateBadge } from "@/features/content/post-state-badge";
import { PostArt } from "@repo/ui/components/social/post-art";
import { FailAlert } from "./fail-alert";
import { WhenItGoesOutChoice } from "./when-it-goes-out-choice";

const CLOSE_DELAY = 250;

/**
 * FL-2, state 2: the account's connection expired, so the post itself is fine. "Reconnect and
 * try again" chains connectAccount into the same reschedule the size panel uses; "Change and try
 * again" only changes when it goes out, since the post itself needs no fix here.
 */
export function FailedConnectionPanel({ post, brand }: { post: PostView; brand: BrandKit }) {
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
    success: "It goes back on the schedule.",
    failure: "Couldn't retry that.",
  });
  const reconnect = useServerAction(connectAccount, {
    onSuccess: () => retry.run(post.id, when),
    failure: "Couldn't reconnect.",
  });

  const pending = retry.isPending || reconnect.isPending;
  const due = post.scheduledFor ? format(parseISO(post.scheduledFor), "EEE d MMM, h:mm a") : "No time set";
  const platformLabel = PLATFORM_LABEL[post.platform];

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => !next && close(CLOSE_DELAY)}
      title="Post didn’t go out"
      description={`Reconnect ${platformLabel} and it goes out straight away`}
      footer={
        <>
          <Button type="button" variant="outline" className="mr-auto" disabled={pending} onClick={() => retry.run(post.id, when)}>
            <Pencil /> Change and try again
          </Button>
          <Button type="button" disabled={pending} onClick={() => reconnect.run(post.brandId, post.platform)}>
            <PlatformIcon platform={post.platform} /> Reconnect {platformLabel} and try again
          </Button>
        </>
      }
    >
      <div className="grid gap-4.5">
        <PostFacts platform={post.platform} format={post.format} slides={post.slides} durationSec={post.durationSec} date={`Was due ${due}`}>
          <PostStateBadge post={post} />
        </PostFacts>

        {post.failure && (
          <FailAlert heading={`Your ${platformLabel} connection expired`} triedAt={post.failure.at}>
            {post.failure.reason} This happens after a password change, or when {platformLabel} asks you to confirm access again.
            Nothing was posted.
          </FailAlert>
        )}

        <PostArt post={post} brand={brand} className="mx-auto h-52 w-auto max-w-full" />

        <p className="flex gap-2 rounded-md bg-tint p-3 text-[0.8125rem] leading-snug text-tint-foreground">
          Reconnecting takes about a minute on {platformLabel}. Your other approved {platformLabel} posts wait until then;
          posts on your other platforms aren’t affected.
        </p>

        <WhenItGoesOutChoice
          title="When it goes out after you reconnect"
          asapLabel="Straight away"
          asapIso={asapIso}
          value={when}
          onChange={setWhen}
          disabled={pending}
        />
      </div>
    </Sheet>
  );
}
