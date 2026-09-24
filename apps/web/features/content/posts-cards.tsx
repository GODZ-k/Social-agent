import { format } from "date-fns";
import type { BrandKit } from "@social-agent/shared";
import { PlatformIcon, StatusBadge } from "@repo/ui/components/social/platform";
import { PostArt } from "@repo/ui/components/social/post-art";
import type { Row } from "./use-post-rows";

/** Phones: the same rows, sorted and filtered by the same table, as cards. */
export function PostsCards({ posts, brand, onOpen }: { posts: Row[]; brand: BrandKit; onOpen: (postId: string) => void }) {
  return (
    <ul className="grid gap-2.5 md:hidden">
      {posts.map((post) => (
        <li key={post.id}>
          <button type="button" onClick={() => onOpen(post.id)} className="pressable flex w-full items-center gap-3.5 rounded-xl bg-card p-3 text-left shadow-raised">
            <PostArt post={post} brand={brand} fixedAspect="aspect-square" className="w-16 shrink-0" />
            <span className="grid min-w-0 flex-1 gap-1">
              <span className="truncate font-medium">{post.hook}</span>
              <span className="type-label flex items-center gap-1.5">
                <PlatformIcon platform={post.platform} className="size-3.5" />
                {post.when ? format(new Date(post.when), "d MMM, h:mm a") : "No date"}
              </span>
              <StatusBadge status={post.status} />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
