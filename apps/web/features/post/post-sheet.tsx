"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePost } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { BrandKit, Post, PostStatus, Strategy } from "@/lib/types";
import { Sheet } from "@repo/ui/components/sheet";
import { Button } from "@repo/ui/components/button";
import { FORMAT_LABEL, PLATFORM_LABEL } from "@repo/ui/components/social/platform";
import { PostLightbox } from "@repo/ui/components/social/post-lightbox";
import { MediaPicker } from "./media-picker";
import { PostForm } from "./post-form";
import { PostMetrics } from "./post-metrics";
import { PostSummary } from "./post-summary";
import { ScheduleFields } from "./schedule-fields";
import { schema, toPatch, toValues, type Values } from "./schema";

/** An approval comes back as "scheduled", so the toast compares against the status before saving. */
function savedMessage(saved: Post, before: Post) {
  if (before.status !== "in_review") return "Changes saved";
  if (saved.status === "rejected") return "Rejected";
  if (saved.status === "approved" || saved.status === "scheduled") return "Approved";
  return "Changes saved";
}

export function PostSheet({
  post: current,
  brand,
  strategy,
  onClose,
}: {
  post: Post | null;
  brand: BrandKit;
  strategy: Strategy | null;
  onClose: () => void;
}) {
  // Keep showing the last post while the sheet animates out after `post` goes null.
  const [post, setPost] = useState(current);
  if (current && current !== post) setPost(current);

  const [viewing, setViewing] = useState(false);
  const update = useServerAction(updatePost, { success: (saved) => (post ? savedMessage(saved, post) : "Changes saved") });
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { hook: "", caption: "", hashtags: [], mediaUrl: null, date: "", time: "" },
  });

  useEffect(() => {
    if (current) form.reset(toValues(current));
  }, [current, form]);

  const locked = post?.status === "published";
  const live = useWatch({ control: form.control });
  const preview = post && { ...post, hook: live.hook || post.hook, mediaUrl: live.mediaUrl ?? null };

  function save(values: Values, status?: PostStatus) {
    if (!post) return;
    update.run(post.id, toPatch(values, status));
    onClose();
  }

  return (
    <>
      <Sheet
        open={!!current}
        onOpenChange={(open) => !open && onClose()}
        title={locked ? "Published post" : "Edit post"}
        description={post ? `${PLATFORM_LABEL[post.platform]} ${FORMAT_LABEL[post.format].toLowerCase()}` : undefined}
        footer={
          post && !locked ? (
            <>
              {post.status === "in_review" && (
                <Button type="button" variant="outline" className="flex-1" onClick={form.handleSubmit((v) => save(v, "rejected"))}>
                  Reject
                </Button>
              )}
              <Button type="button" variant={post.status === "in_review" ? "secondary" : "default"} className="flex-1" onClick={form.handleSubmit((v) => save(v))}>
                Save changes
              </Button>
              {post.status === "in_review" && (
                <Button type="button" className="flex-1" onClick={form.handleSubmit((v) => save(v, "approved"))}>
                  Approve
                </Button>
              )}
            </>
          ) : undefined
        }
      >
        {post && preview && (
          <div className="grid gap-6">
            <PostSummary post={post} preview={preview} brand={brand} onView={() => setViewing(true)}>
              {!locked && (
                <MediaPicker
                  mediaUrl={live.mediaUrl ?? null}
                  onPick={(dataUrl) => form.setValue("mediaUrl", dataUrl, { shouldDirty: true })}
                  onReset={() => form.setValue("mediaUrl", null, { shouldDirty: true })}
                />
              )}
            </PostSummary>

            {post.metrics && <PostMetrics metrics={post.metrics} />}

            <PostForm form={form} locked={locked} mediaUrl={live.mediaUrl ?? null} onSubmit={(v) => save(v)}>
              {!locked && <ScheduleFields form={form} platform={post.platform} strategy={strategy} />}
            </PostForm>
          </div>
        )}
      </Sheet>

      {preview && <PostLightbox post={preview} brand={brand} open={viewing} onOpenChange={setViewing} />}
    </>
  );
}
