import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import type { BrandKit } from "@social-agent/shared";
import type { PostView } from "@/lib/types";
import { PostArt } from "@repo/ui/components/social/post-art";
import { Button } from "@repo/ui/components/button";
import { PostStateBadge } from "@/components/post/post-state-badge";
import { formatDetail } from "@/lib/format-post";
import { PlatformFormatCell } from "./platform-format";
import { ScheduleCell } from "./schedule";

/** A post the network refused (FL-2), pinned above the rest with its own accent, reason and "See why". */
export function FailedTableRow({ post, brand, pathname }: { post: PostView; brand: BrandKit; pathname: string }) {
  const href = `${pathname}?post=${post.id}`;
  const when = post.scheduledFor ?? post.publishedAt;
  const detail = formatDetail(post);

  return (
    <tr className="relative cursor-pointer border-b shadow-[inset_3px_0_0_var(--destructive)] transition-colors last:border-0 hover:bg-tint/60">
      <td className="w-[38%] max-w-0 py-3 pr-5 pl-3.5">
        <Link href={href} scroll={false} className="flex min-w-0 items-center gap-3.5 after:absolute after:inset-0">
          <PostArt post={post} brand={brand} fixedAspect="aspect-square" className="w-11 shrink-0 rounded-md" />
          <span className="min-w-0">
            <span className="block truncate font-medium">{post.hook}</span>
            <span className="type-label truncate">Theme: {post.theme}</span>
          </span>
        </Link>
      </td>
      <td className="px-5 py-3">
        <PlatformFormatCell platform={post.platform} format={post.format} detail={detail} />
      </td>
      <td className="px-5 py-3">
        <PostStateBadge post={post} />
        {post.failure && (
          <p className="mt-1.5 flex max-w-60 items-start gap-1 text-xs leading-snug text-destructive">
            <TriangleAlert className="mt-0.5 size-3 shrink-0" />
            {post.failure.reason}
          </p>
        )}
      </td>
      <td className="px-5 py-3 whitespace-nowrap">
        <ScheduleCell when={when} />
      </td>
      <td className="relative px-5 py-3 text-right">
        <Button asChild size="sm" variant="outline" className="border-destructive/25 bg-destructive/10 text-destructive hover:bg-destructive/15">
          <Link href={href} scroll={false}>See why</Link>
        </Button>
      </td>
    </tr>
  );
}
