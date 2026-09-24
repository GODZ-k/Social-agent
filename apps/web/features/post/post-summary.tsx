import { Maximize2, Sparkles } from "lucide-react";
import type { BrandKit } from "@social-agent/shared";
import type { Post } from "@/lib/types";
import { PLATFORM_LABEL, PlatformIcon, StatusBadge } from "@repo/ui/components/social/platform";
import { PostArt } from "@repo/ui/components/social/post-art";

/** `children` is the media picker, present while the post can still be edited. */
export function PostSummary({
  post,
  preview,
  brand,
  onView,
  children,
}: {
  post: Post;
  /** The post with the form's unsaved headline and image, so the thumbnail follows the edits. */
  preview: Post;
  brand: BrandKit;
  onView: () => void;
  children?: React.ReactNode;
}) {
  return (
    <>
      <div className="flex gap-4">
        {/* The picture is a button: the obvious thing to do with a thumbnail is open it. */}
        <button
          type="button"
          onClick={onView}
          aria-label="View the image at full size"
          className="pressable group relative w-36 shrink-0 self-start rounded-lg shadow-raised"
        >
          <PostArt post={preview} brand={brand} />
          <span className="absolute right-2 bottom-2 grid size-7 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
            <Maximize2 className="size-3.5" />
          </span>
        </button>
        <div className="grid min-w-0 content-start gap-2.5">
          <StatusBadge status={post.status} />
          <p className="flex items-center gap-1.5 text-sm">
            <PlatformIcon platform={post.platform} className="text-muted-foreground" />
            {PLATFORM_LABEL[post.platform]}
          </p>
          {children}
        </div>
      </div>

      <p className="flex gap-2 rounded-md bg-tint p-3 text-[0.8125rem] leading-snug text-tint-foreground">
        <Sparkles className="mt-0.5 size-3.5 shrink-0" />
        {post.aiNote}
      </p>
    </>
  );
}
