"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { format } from "date-fns";
import { Maximize2, Pencil } from "lucide-react";
import { reschedulePost } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { PostView, Strategy } from "@/lib/types";
import { spring } from "@repo/ui/lib/motion";
import { Button } from "@repo/ui/components/button";
import { Panel } from "@repo/ui/components/states";
import { PostFacts } from "@repo/ui/components/social/post-facts";
import { relativeDayLabel } from "@/lib/format-post";
import { bestTimesOnDay } from "@/components/post/best-times-on-day";
import { NotConnectedNote } from "@/components/post/not-connected-note";
import { PostCaptionHashtags } from "@/components/post/post-caption-hashtags";
import { PostReasonNote } from "@/components/post/post-reason-note";
import { TimeChangePills } from "@/components/post/time-change-pills";

interface Props {
  post: PostView;
  pillar: string | undefined;
  strategy: Strategy | null;
  connected: boolean;
  editHref: string;
  onViewSlides: () => void;
}

/** Wide screens: the whole post is readable, and the schedule is editable, without opening anything. */
export function PostSidePanel({ post, pillar, strategy, connected, editHref, onViewSlides }: Props) {
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
    <aside className="hidden lg:block" aria-label="Full post">
      <Panel>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={post.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring.snappy} className="grid gap-4">
            <div>
              <h2 className="type-heading">{post.hook}</h2>
              {pillar && <p className="type-label mt-1">Theme: {pillar}</p>}
            </div>

            <PostFacts platform={post.platform} format={post.format} slides={post.slides} durationSec={post.durationSec} />

            {when && (
              <div className="grid gap-1.5 rounded-2xl bg-secondary p-4">
                <p className="type-label">Goes out</p>
                <p className="font-display text-[1.25rem] font-semibold tracking-tight tabular-nums">{format(when, "EEEE d MMMM, h:mm a")}</p>
                <p className="type-label">{relativeDayLabel(when)}</p>
                <TimeChangePills times={times} currentTime={currentTime} onChange={changeTime} disabled={reschedule.isPending} />
              </div>
            )}

            <PostCaptionHashtags post={post} />
            <PostReasonNote note={post.aiNote} />
            {!connected && <NotConnectedNote platform={post.platform} />}

            <div className="flex flex-wrap gap-2.5">
              <Button variant="outline" asChild>
                <Link href={editHref}>
                  <Pencil /> Edit post
                </Link>
              </Button>
              <Button variant="ghost" onClick={onViewSlides}>
                <Maximize2 /> See all slides full size
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </Panel>
    </aside>
  );
}
