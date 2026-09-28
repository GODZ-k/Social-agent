import type { Post } from "@/lib/types";

/** The caption and hashtags, read-only: content changes go through "Ask for changes", not typing here. */
export function PostCaptionHashtags({ post }: { post: Pick<Post, "caption" | "hashtags"> }) {
  return (
    <>
      <div>
        <p className="type-label mb-1">Caption</p>
        <p className="whitespace-pre-wrap text-[0.9375rem]">{post.caption}</p>
      </div>
      <div>
        <p className="type-label mb-1.5">Hashtags</p>
        <div className="flex flex-wrap gap-1.5">
          {post.hashtags.length === 0 ? (
            <span className="text-muted-foreground text-sm">None</span>
          ) : (
            post.hashtags.map((tag) => (
              <span key={tag} className="rounded-full bg-secondary px-2.5 py-1 text-[0.8125rem] font-medium">
                {tag}
              </span>
            ))
          )}
        </div>
      </div>
    </>
  );
}
