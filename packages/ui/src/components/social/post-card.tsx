import type { BrandKit, Post, PostStatus } from "./types";
import { PostArt } from "./post-art";
import { PostKind } from "./post-kind";
import { cn } from "../../lib/utils";

export interface PostCardPost extends Pick<Post, "platform" | "format" | "hook" | "art" | "durationSec" | "mediaUrl"> {
  status: PostStatus;
  slides?: number;
}

/**
 * One post, small: its preview, where it goes and what kind it is, when it
 * goes out, and whether it still needs the owner. Used by This week, the
 * calendar and the agent chat. It holds no link: the caller wraps it in the
 * link that opens the post, and should label that link with describePostKind.
 */
export function PostCard({
  post,
  brand,
  when,
  className,
}: {
  post: PostCardPost;
  brand: BrandKit;
  /** Already formatted by the caller, in the viewer's time zone: "Thu 1:00 PM". */
  when: string;
  className?: string;
}) {
  const needsApproval = post.status === "in_review";
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-xl bg-card p-1.5 pr-2.5 text-xs leading-snug transition-shadow",
        // Never both: tailwind-merge doesn't know shadow-raised conflicts with shadow-[...], so CSS order would pick.
        needsApproval
          ? "shadow-[inset_3px_0_0_var(--warning),var(--elevation-raised)] hover:shadow-[inset_3px_0_0_var(--warning),var(--elevation-floating)]"
          : "shadow-raised hover:shadow-floating",
        className,
      )}
    >
      <PostArt post={{ ...post, hook: "" }} brand={brand} fixedAspect="aspect-square" className="size-12 shrink-0 rounded-lg" />
      <div className="grid min-w-0 gap-0.5">
        <PostKind platform={post.platform} format={post.format} slides={post.slides} durationSec={post.durationSec} className="text-[0.6875rem]" />
        <span className="font-medium tabular-nums">{when}</span>
        <span className="line-clamp-2 text-muted-foreground">{post.hook}</span>
        {needsApproval && <span className="text-[0.6875rem] font-semibold text-warning">Needs approval</span>}
      </div>
    </div>
  );
}
