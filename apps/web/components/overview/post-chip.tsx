import Link from "next/link";
import { format, parseISO } from "date-fns";
import type { BrandKit } from "@social-agent/shared";
import type { PostView } from "@/lib/types";
import { PostCard } from "@repo/ui/components/social/post-card";
import { describePostKind } from "@repo/ui/components/social/post-kind";

/**
 * One post from This week or the agent chat. The caller decides where it opens
 * to: `?post=<id>` on whatever page it is shown on.
 */
export function PostChip({ post, brand, href, className }: { post: PostView; brand: BrandKit; href: string; className?: string }) {
  const when = post.scheduledFor ? format(parseISO(post.scheduledFor), "EEE h:mm a") : "Not scheduled";
  const needsApproval = post.state === "needs_approval";
  const label = `${describePostKind(post)}, ${when}, ${post.hook}${needsApproval ? ", needs approval" : ""}`;

  return (
    <Link href={href} scroll={false} aria-label={label} className={className}>
      <PostCard post={post} brand={brand} when={when} />
    </Link>
  );
}
