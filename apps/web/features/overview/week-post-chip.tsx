import Link from "next/link";
import { format, parseISO } from "date-fns";
import type { BrandKit } from "@social-agent/shared";
import type { PostView } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PostArt } from "@repo/ui/components/social/post-art";
import { PlatformIcon } from "@repo/ui/components/social/platform";
import { FORMAT_NAME } from "@repo/ui/components/social/format-badge";
import { describePostKind, postDetail } from "@repo/ui/components/social/post-kind";

/**
 * One post in the week grid: a rounded tile per day, `?post=<id>` on this page. Below `lg` it is
 * a row (small thumbnail beside the text); at `lg` and up the art sits on top, full width, with a
 * neutral platform line below it (the day column is too narrow for the coloured `PlatformLabel`).
 * A fixed height (not `h-fit`) keeps every chip the same size regardless of content: long hooks
 * are clipped (`line-clamp-2`) rather than growing the tile.
 */
export function WeekPostChip({ post, brand, href }: { post: PostView; brand: BrandKit; href: string }) {
  const when = post.scheduledFor ? format(parseISO(post.scheduledFor), "EEE h:mm a") : "Not scheduled";
  const needsApproval = post.state === "needs_approval";
  const failed = post.state === "failed";
  const detail = postDetail(post);
  const label = `${describePostKind(post)}, ${when}, ${post.hook}${failed ? ", didn't go out" : needsApproval ? ", needs approval" : ""}`;

  return (
    <Link
      href={href}
      scroll={false}
      aria-label={label}
      className={cn(
        "flex h-[4.5rem] items-center gap-2.5 overflow-hidden rounded-xl bg-card p-1.5 pr-2.5 text-xs leading-snug transition-shadow",
        "md:h-40 md:flex-col md:items-stretch md:gap-1.5 md:p-1.5",
        // Never more than one: tailwind-merge doesn't know shadow-raised conflicts with shadow-[...], so CSS order would pick.
        failed
          ? "shadow-[inset_3px_0_0_var(--destructive),var(--elevation-raised)] hover:shadow-[inset_3px_0_0_var(--destructive),var(--elevation-floating)]"
          : needsApproval
            ? "shadow-[inset_3px_0_0_var(--warning),var(--elevation-raised)] hover:shadow-[inset_3px_0_0_var(--warning),var(--elevation-floating)]"
            : "shadow-raised hover:shadow-floating",
      )}
    >
      <PostArt
        post={{ ...post, hook: "" }}
        brand={brand}
        fixedAspect="aspect-square"
        className="size-12 shrink-0 rounded-lg md:h-[4.5rem] md:w-full md:shrink"
      />
      <div className="grid min-w-0 gap-0.5 md:px-0.5 md:pb-0.5">
        <span className="inline-flex min-w-0 items-center gap-1 text-[0.6875rem] font-semibold text-muted-foreground">
          <PlatformIcon platform={post.platform} className="size-3.5 shrink-0" />
          <span className="truncate">
            {FORMAT_NAME[post.format].toLowerCase()}
            {detail && <span className="font-normal">, {detail}</span>}
          </span>
        </span>
        <span className="font-medium tabular-nums">{when}</span>
        <span className="line-clamp-2 text-muted-foreground">{post.hook}</span>
        {failed ? (
          <span className="text-[0.6875rem] font-semibold text-destructive">Didn&rsquo;t go out</span>
        ) : (
          needsApproval && <span className="text-[0.6875rem] font-semibold text-warning">Needs approval</span>
        )}
      </div>
    </Link>
  );
}
