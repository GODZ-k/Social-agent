import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ChevronRight } from "lucide-react";
import type { BrandKit } from "@social-agent/shared";
import type { PostView } from "@/lib/types";
import { PostArt } from "@repo/ui/components/social/post-art";
import { PLATFORM_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";
import { FORMAT_NAME } from "@repo/ui/components/social/format-badge";
import { Button } from "@repo/ui/components/button";
import { PostStateBadge } from "./post-state-badge";
import { formatDetail, relativeDayLabel } from "./format-post";
import { DraftingCardRow } from "./drafting-card-row";
import { FailedCardRow } from "./failed-card-row";
import { NewBadge } from "./new-badge";
import type { DraftingSlot } from "./use-generate-posts";

/** Phones and tablets below 900px: `ContentTable`'s rows folded into cards, same "New drafts"
 * divider and drafting rows at the end (FL-4). */
export function ContentCards({
  posts,
  brand,
  pathname,
  newIds = new Set(),
  draftingSlots = [],
}: {
  posts: PostView[];
  brand: BrandKit;
  pathname: string;
  newIds?: Set<string>;
  draftingSlots?: DraftingSlot[];
}) {
  const failed = posts.filter((post) => post.state === "failed");
  const rest = posts.filter((post) => post.state !== "failed");

  return (
    <ul className="divide-y rounded-xl bg-card shadow-raised min-[900px]:hidden">
      {failed.map((post) => (
        <FailedCardRow key={post.id} post={post} brand={brand} pathname={pathname} />
      ))}
      {failed.length > 0 && rest.length > 0 && <li className="px-3 py-2 text-xs font-medium text-muted-foreground">Coming up</li>}
      {rest.map((post) => {
        const href = `${pathname}?post=${post.id}`;
        const when = post.scheduledFor ?? post.publishedAt;
        const detail = formatDetail(post);
        return (
          <li key={post.id} className="relative flex items-center gap-3 p-3">
            {/* The link stretches over the whole card, so a tap anywhere opens the post. */}
            <Link href={href} scroll={false} className="flex min-w-0 flex-1 items-center gap-3 after:absolute after:inset-0">
              <PostArt post={post} brand={brand} fixedAspect="aspect-square" className="size-14 shrink-0" />
              <span className="grid min-w-0 flex-1 gap-1">
                <span className="truncate font-medium">
                  {post.hook}
                  {newIds.has(post.id) && <NewBadge />}
                </span>
                <span className="type-label truncate">Theme: {post.theme}</span>
                <span className="flex items-center gap-1.5 text-sm">
                  <PlatformIcon platform={post.platform} className="size-3.5 text-muted-foreground" />
                  <b className="font-medium">
                    {PLATFORM_LABEL[post.platform]} {FORMAT_NAME[post.format].toLowerCase()}
                  </b>
                  {detail && <span className="text-muted-foreground">, {detail}</span>}
                </span>
                <PostStateBadge post={post} />
                {when && (
                  <span className="flex items-baseline gap-1.5 text-sm">
                    <span className="tabular-nums">{format(parseISO(when), "EEE d MMM, h:mm a")}</span>
                    <span className="type-label">{relativeDayLabel(parseISO(when))}</span>
                  </span>
                )}
              </span>
            </Link>
            {post.state === "needs_approval" ? (
              <Button asChild size="sm" className="relative shrink-0">
                <Link href={href} scroll={false}>Review</Link>
              </Button>
            ) : (
              <ChevronRight className="relative size-4 shrink-0 text-muted-foreground" />
            )}
          </li>
        );
      })}
      {draftingSlots.length > 0 && (
        <>
          <li className="px-3 py-2 text-xs font-medium text-muted-foreground">New drafts</li>
          {draftingSlots.map((slot) => (
            <DraftingCardRow key={slot.id} slot={slot} />
          ))}
        </>
      )}
    </ul>
  );
}
