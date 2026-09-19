import { format } from "date-fns";
import { Sparkles } from "lucide-react";
import { FORMAT_LABEL, PLATFORM_LABEL, PlatformIcon } from "./platform";
import type { Post } from "./types";

/**
 * Everything a person needs to read before deciding on a post: the whole
 * caption, the hashtags, when and where it goes out, and why the agent made it.
 */
export function PostDetails({ post, pillar }: { post: Post; pillar?: string }) {
  return (
    <div className="grid gap-5">
      <div>
        <h2 className="type-heading">{post.hook}</h2>
        <p className="type-label mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <PlatformIcon platform={post.platform} className="size-3.5" />
          <span>{PLATFORM_LABEL[post.platform]} {FORMAT_LABEL[post.format].toLowerCase()}</span>
          {pillar && <span>in {pillar}</span>}
        </p>
      </div>

      <dl className="grid gap-4">
        <div>
          <dt className="type-label">Goes out</dt>
          <dd className="tabular-nums">
            {post.scheduledFor ? format(new Date(post.scheduledFor), "EEEE d MMMM, h:mm a") : "No publish time yet"}
          </dd>
        </div>
        <div>
          <dt className="type-label">Caption</dt>
          <dd className="max-w-[62ch] whitespace-pre-wrap">{post.caption}</dd>
        </div>
        <div>
          <dt className="type-label mb-1.5">Hashtags</dt>
          <dd className="flex flex-wrap gap-1.5">
            {post.hashtags.length === 0 ? (
              <span className="text-muted-foreground">None</span>
            ) : (
              post.hashtags.map((tag) => (
                <span key={tag} className="rounded-full bg-secondary px-2.5 py-1 text-[0.8125rem] font-medium">{tag}</span>
              ))
            )}
          </dd>
        </div>
      </dl>

      <p className="flex gap-2 rounded-md bg-tint p-3 text-[0.8125rem] leading-snug text-tint-foreground">
        <Sparkles className="mt-0.5 size-3.5 shrink-0" />
        {post.aiNote}
      </p>
    </div>
  );
}
