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
import { DraftingTableRow } from "./drafting-table-row";
import { FailedTableRow } from "./failed-table-row";
import { NewBadge } from "./new-badge";
import type { DraftingSlot } from "./use-generate-posts";

/** The wide-screen list: one row per post, soonest first, plus the batch still drafting
 * appended under a "New drafts" divider (FL-4). Cards below 900px carry the same rows. */
export function ContentTable({
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
  // Posts the network refused stay at the top until they're fixed (FL-2); everything else keeps
  // the soonest-first order it already came in.
  const failed = posts.filter((post) => post.state === "failed");
  const rest = posts.filter((post) => post.state !== "failed");

  return (
    <div className="hidden overflow-hidden rounded-xl bg-card shadow-raised min-[900px]:block">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b">
            <th scope="col" className="px-5 py-3 text-left font-medium text-muted-foreground">Post</th>
            <th scope="col" className="px-5 py-3 text-left font-medium text-muted-foreground">Where it goes</th>
            <th scope="col" className="px-5 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th scope="col" className="px-5 py-3 text-left font-medium text-muted-foreground">Goes out</th>
            <th scope="col" className="px-5 py-3"><span className="sr-only">Open</span></th>
          </tr>
        </thead>
        <tbody>
          {failed.map((post) => (
            <FailedTableRow key={post.id} post={post} brand={brand} pathname={pathname} />
          ))}
          {failed.length > 0 && rest.length > 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-2 text-xs font-medium text-muted-foreground">
                Coming up
              </td>
            </tr>
          )}
          {rest.map((post) => {
            const href = `${pathname}?post=${post.id}`;
            const when = post.scheduledFor ?? post.publishedAt;
            const detail = formatDetail(post);
            return (
              // The post link stretches over the whole row, so a click anywhere opens the post.
              <tr key={post.id} className="relative cursor-pointer border-b transition-colors last:border-0 hover:bg-tint/60">
                <td className="w-[38%] max-w-0 px-5 py-3">
                  <Link href={href} scroll={false} className="flex min-w-0 items-center gap-3.5 after:absolute after:inset-0">
                    <PostArt post={post} brand={brand} fixedAspect="aspect-square" className="w-11 shrink-0 rounded-md" />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {post.hook}
                        {newIds.has(post.id) && <NewBadge />}
                      </span>
                      <span className="type-label truncate">Theme: {post.theme}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <PlatformIcon platform={post.platform} className="text-muted-foreground" />
                    <span>
                      <b className="font-medium">
                        {PLATFORM_LABEL[post.platform]} {FORMAT_NAME[post.format].toLowerCase()}
                      </b>
                      {detail && <span className="text-muted-foreground">, {detail}</span>}
                    </span>
                  </span>
                </td>
                <td className="px-5 py-3">
                  <PostStateBadge post={post} />
                </td>
                <td className="px-5 py-3 whitespace-nowrap">
                  {when ? (
                    <>
                      <span className="block tabular-nums">{format(parseISO(when), "EEE d MMM, h:mm a")}</span>
                      <span className="type-label">{relativeDayLabel(parseISO(when))}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </td>
                <td className="relative px-5 py-3 text-right">
                  {post.state === "needs_approval" ? (
                    <Button asChild size="sm">
                      <Link href={href} scroll={false}>Review</Link>
                    </Button>
                  ) : (
                    <Link href={href} scroll={false} aria-label="Open post" className="inline-flex text-muted-foreground">
                      <ChevronRight />
                    </Link>
                  )}
                </td>
              </tr>
            );
          })}
          {draftingSlots.length > 0 && (
            <>
              <tr>
                <td colSpan={5} className="px-5 py-2 text-xs font-medium text-muted-foreground">
                  New drafts
                </td>
              </tr>
              {draftingSlots.map((slot) => (
                <DraftingTableRow key={slot.id} slot={slot} />
              ))}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
