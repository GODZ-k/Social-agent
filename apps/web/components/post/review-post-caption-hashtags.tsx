"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { updatePost } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { PostView } from "@/lib/types";
import { CAPTION_LIMIT } from "@/lib/forms/post";

interface Props {
  post: Pick<PostView, "id" | "caption" | "hashtags">;
}

/** Caption and hashtags, edited in the review sheet: every change saves as it happens, like the schedule fields. */
export function ReviewPostCaptionHashtags({ post }: Props) {
  const [caption, setCaption] = useState(post.caption);
  const [hashtags, setHashtags] = useState(post.hashtags);
  const [draft, setDraft] = useState("");
  // Follow the server's post without an effect: a new post (prev/next) resets the fields.
  const [knownPostId, setKnownPostId] = useState(post.id);
  if (post.id !== knownPostId) {
    setKnownPostId(post.id);
    setCaption(post.caption);
    setHashtags(post.hashtags);
    setDraft("");
  }

  const save = useServerAction(updatePost, { failure: "Couldn't save that." });

  function commitCaption() {
    if (caption !== post.caption) save.run(post.id, { caption });
  }

  function addHashtag() {
    const tag = draft.trim().replace(/^#*/, "#");
    if (tag === "#" || hashtags.includes(tag)) {
      setDraft("");
      return;
    }
    const next = [...hashtags, tag];
    setHashtags(next);
    setDraft("");
    save.run(post.id, { hashtags: next });
  }

  function removeHashtag(tag: string) {
    const next = hashtags.filter((h) => h !== tag);
    setHashtags(next);
    save.run(post.id, { hashtags: next });
  }

  return (
    <>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="review-caption" className="type-label">
            Caption
          </label>
          <p className="type-label tabular-nums">
            {caption.length.toLocaleString()} / {CAPTION_LIMIT.toLocaleString()}
          </p>
        </div>
        <textarea
          id="review-caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          onBlur={commitCaption}
          rows={4}
          maxLength={CAPTION_LIMIT}
          className="w-full resize-none rounded-xl bg-secondary p-3 text-[0.9375rem] leading-snug outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>

      <div>
        <p className="type-label mb-1.5">Hashtags</p>
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-secondary p-2.5">
          {hashtags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-[0.8125rem] font-medium shadow-[0_0_0_1px_var(--border)]"
            >
              {tag}
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                onClick={() => removeHashtag(tag)}
                className="pressable text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addHashtag();
              }
            }}
            onBlur={() => draft && addHashtag()}
            placeholder="Add a hashtag"
            className="min-w-24 flex-1 bg-transparent text-[0.8125rem] outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </>
  );
}
