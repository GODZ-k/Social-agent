import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import type { BrandKit } from "@social-agent/shared";
import type { PostView } from "@/lib/types";
import { PostArt } from "@repo/ui/components/social/post-art";
import { Button } from "@repo/ui/components/button";
import { PostStateBadge } from "./post-state-badge";
import { formatDetail } from "./format-post";
import { PlatformFormatLine } from "./platform-format";
import { ScheduleLine } from "./schedule";

/** `FailedTableRow`'s phone and tablet card: same accent, reason line and "See why". */
export function FailedCardRow({ post, brand, pathname }: { post: PostView; brand: BrandKit; pathname: string }) {
  const href = `${pathname}?post=${post.id}`;
  const when = post.scheduledFor ?? post.publishedAt;
  const detail = formatDetail(post);

  return (
    <li className="relative flex items-center gap-3 p-3 shadow-[inset_3px_0_0_var(--destructive)]">
      <Link href={href} scroll={false} className="flex min-w-0 flex-1 items-center gap-3 after:absolute after:inset-0">
        <PostArt post={post} brand={brand} fixedAspect="aspect-square" className="size-14 shrink-0" />
        <span className="grid min-w-0 flex-1 gap-1">
          <span className="truncate font-medium">{post.hook}</span>
          <span className="type-label truncate">Theme: {post.theme}</span>
          <PlatformFormatLine platform={post.platform} format={post.format} detail={detail} />
          <PostStateBadge post={post} />
          {post.failure && (
            <span className="flex items-start gap-1 text-xs leading-snug text-destructive">
              <TriangleAlert className="mt-0.5 size-3 shrink-0" />
              {post.failure.reason}
            </span>
          )}
          <ScheduleLine when={when} />
        </span>
      </Link>
      <Button asChild size="sm" className="relative shrink-0 border-destructive/25 bg-destructive/10 text-destructive hover:bg-destructive/15" variant="outline">
        <Link href={href} scroll={false}>See why</Link>
      </Button>
    </li>
  );
}
