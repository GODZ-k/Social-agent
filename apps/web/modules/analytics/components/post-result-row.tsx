import { format, parseISO } from "date-fns";
import type { PostView } from "@/lib/types";
import type { BrandKit } from "@social-agent/shared";
import { cn } from "@/lib/utils";
import { formatNumber } from "@repo/ui/lib/utils";
import { FORMAT_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";
import { PostArt } from "@repo/ui/components/social/post-art";
import type { PostReason } from "@/lib/post-reason";

export function PostResultRow({ post, brand, reason }: { post: PostView; brand: BrandKit; reason: PostReason }) {
  const metrics = post.metrics!;

  return (
    <li className="flex items-center gap-4 rounded-lg py-2.5">
      <PostArt post={post} brand={brand} fixedAspect="aspect-square" className="w-14 shrink-0 rounded-md" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{post.hook}</p>
        <p className="type-label flex items-center gap-1.5">
          <PlatformIcon platform={post.platform} className="size-3.5" />
          {FORMAT_LABEL[post.format]}, {format(parseISO(post.publishedAt!), "d MMM")}
        </p>
        <p className={cn("mt-1 text-[0.8125rem] leading-snug", reason.tone === "good" ? "text-success" : "text-warning")}>{reason.text}</p>
      </div>
      <dl className="flex shrink-0 gap-5 text-right">
        <div>
          <dd className="type-number">{formatNumber(metrics.reach)}</dd>
          <dt className="type-label">reach</dt>
        </div>
        <div className="max-sm:hidden">
          <dd className="type-number">{formatNumber(metrics.saves)}</dd>
          <dt className="type-label">saves</dt>
        </div>
        <div className="max-sm:hidden">
          <dd className="type-number">{metrics.follows ? `+${formatNumber(metrics.follows)}` : "0"}</dd>
          <dt className="type-label">followers</dt>
        </div>
      </dl>
    </li>
  );
}
