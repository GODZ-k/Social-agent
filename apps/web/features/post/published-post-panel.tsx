"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { BarChart3, CircleCheck, ExternalLink } from "lucide-react";
import type { BrandKit, Platform } from "@social-agent/shared";
import type { PostView } from "@/lib/types";
import { bestPostReason } from "@/features/analytics/post-reason";
import { PostStateBadge } from "@/features/content/post-state-badge";
import { Sheet } from "@repo/ui/components/sheet";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { PostArt } from "@repo/ui/components/social/post-art";
import { PostFacts } from "@repo/ui/components/social/post-facts";
import { PLATFORM_LABEL } from "@repo/ui/components/social/platform";
import { PublishedPostMetrics } from "./published-post-metrics";

const PLATFORM_DOMAIN: Record<Platform, string> = {
  instagram: "instagram.com",
  facebook: "facebook.com",
  linkedin: "linkedin.com",
  tiktok: "tiktok.com",
};

const CLOSE_DELAY = 250;

interface Props {
  post: PostView;
  brand: BrandKit;
  /** The connected account's handle, for the link to the live post; null when there is none to link to. */
  handle: string | null;
  /** This post's place among the period's best posts, 0 first; null when it isn't one of them. */
  bestRank: number | null;
  /** The period's average reach, for "reached N times your average post". */
  avgReach: number;
}

/** FL-3: the post as it went out, its first results, and where to see more. Read only — it can't be edited here. */
export function PublishedPostPanel({ post, brand, handle, bestRank, avgReach }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  function close(delay = 0) {
    setOpen(false);
    setTimeout(() => router.push(pathname), delay);
  }

  const platformLabel = PLATFORM_LABEL[post.platform];
  const domain = PLATFORM_DOMAIN[post.platform];
  const liveUrl = handle ? `https://${domain}/${handle}` : null;
  const when = post.publishedAt ? format(parseISO(post.publishedAt), "EEE d MMM, h:mm a") : "Not set";
  const daysSince = post.publishedAt ? Math.max(1, differenceInCalendarDays(new Date(), parseISO(post.publishedAt))) : 1;

  const metrics = post.metrics;
  const reason = metrics && bestRank !== null ? bestPostReason(post, avgReach, bestRank) : null;
  const followLine = metrics?.follows
    ? `${metrics.follows} new ${metrics.follows === 1 ? "follower" : "followers"} the day it went out.`
    : null;

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => !next && close(CLOSE_DELAY)}
      title="Published post"
      description="The post as it went out, and how it did"
      footer={
        <>
          <Button asChild variant="outline" className="mr-auto">
            <Link href={`/c/${post.clientId}/analytics`}>
              <BarChart3 /> See it in Analytics
            </Link>
          </Button>
          {liveUrl ? (
            <Button asChild>
              <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink /> Open on {platformLabel}
              </a>
            </Button>
          ) : (
            <Button disabled>
              <ExternalLink /> Open on {platformLabel}
            </Button>
          )}
        </>
      }
    >
      <div className="grid gap-4.5">
        <PostFacts platform={post.platform} format={post.format} slides={post.slides} durationSec={post.durationSec} date={when}>
          <PostStateBadge post={post} />
        </PostFacts>

        {liveUrl && (
          <div className="flex items-center gap-3 rounded-2xl bg-success/10 p-3.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-success text-white">
              <CircleCheck className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold">Live on {platformLabel}</p>
              <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="block truncate text-[0.8125rem] text-tint-foreground">
                {domain}/{handle}
              </a>
            </div>
          </div>
        )}

        {metrics && (
          <section className="grid gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[0.9375rem] font-semibold">Results after {daysSince === 1 ? "1 day" : `${daysSince} days`}</p>
              {bestRank === 0 && <Badge variant="success">Your best post so far</Badge>}
            </div>
            <PublishedPostMetrics metrics={metrics} />
            {(reason || followLine) && (
              <div className="grid gap-1 text-sm">
                {reason && (
                  <p className="flex gap-2 text-success">
                    <CircleCheck className="mt-0.5 size-3.5 shrink-0" />
                    {reason.text}
                  </p>
                )}
                {followLine && (
                  <p className="flex gap-2 text-success">
                    <CircleCheck className="mt-0.5 size-3.5 shrink-0" />
                    {followLine}
                  </p>
                )}
              </div>
            )}
            <p className="type-label">Numbers update once a day for the first week after a post goes out.</p>
          </section>
        )}

        <PostArt post={post} brand={brand} className="mx-auto h-52 w-auto max-w-full" />

        <div>
          <p className="type-label">Caption as posted</p>
          <p className="mt-1.5 rounded-md bg-secondary p-3 text-[0.9375rem] leading-snug">{post.caption}</p>
        </div>

        <p className="type-label">
          Published posts can&rsquo;t be changed here. To edit or delete it, open it on {platformLabel}.
        </p>
      </div>
    </Sheet>
  );
}
