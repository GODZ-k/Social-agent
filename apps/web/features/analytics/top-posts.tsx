import { format } from "date-fns";
import { listPosts } from "@/lib/api/server";
import type { BrandKit } from "@/lib/types";
import { formatCompact } from "@/lib/utils";
import { Panel } from "@repo/ui/components/states";
import { FORMAT_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";
import { PostArt } from "@repo/ui/components/social/post-art";

/** Reads the posts itself so it can stream in after the charts. */
export async function TopPosts({ clientId, brand }: { clientId: string; brand: BrandKit }) {
  const posts = await listPosts(clientId);
  const topPosts = posts.filter((p) => p.metrics).sort((a, b) => b.metrics!.reach - a.metrics!.reach).slice(0, 5);

  return (
    <Panel aria-labelledby="top-heading">
      <h2 id="top-heading" className="type-heading mb-4">Best performing posts</h2>
      <ol className="grid gap-1">
        {topPosts.map((post, i) => (
          <li key={post.id} className="flex items-center gap-4 rounded-lg py-2">
            <span className="type-number w-5 text-center text-muted-foreground">{i + 1}</span>
            <PostArt post={post} brand={brand} fixedAspect="aspect-square" className="w-12 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{post.hook}</p>
              <p className="type-label flex items-center gap-1.5">
                <PlatformIcon platform={post.platform} className="size-3.5" />
                {FORMAT_LABEL[post.format]}, {format(new Date(post.publishedAt!), "d MMM")}
              </p>
            </div>
            <dl className="flex gap-5 text-right">
              <div><dd className="type-number">{formatCompact(post.metrics!.reach)}</dd><dt className="type-label">reach</dt></div>
              <div className="max-sm:hidden"><dd className="type-number">{formatCompact(post.metrics!.saves)}</dd><dt className="type-label">saves</dt></div>
            </dl>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
