"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ImageUp, Maximize2, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { strategyQuery, useUpdatePost } from "@/lib/api/queries";
import { bestTimesFor } from "@/lib/best-times";
import { normalizeHashtag, readImage } from "@/lib/image";
import type { BrandKit, Post } from "@/lib/types";
import { formatCompact } from "@/lib/utils";
import { Sheet } from "@repo/ui/components/sheet";
import { Button } from "@repo/ui/components/button";
import { Input, Textarea } from "@repo/ui/components/input";
import { TagInput } from "@repo/ui/components/tag-input";
import { DatePicker } from "@repo/ui/components/date-picker";
import { TimePicker } from "@repo/ui/components/time-picker";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";
import { FORMAT_LABEL, PLATFORM_LABEL, PlatformIcon, StatusBadge } from "@repo/ui/components/social/platform";
import { PostArt } from "@repo/ui/components/social/post-art";
import { PostLightbox } from "@repo/ui/components/social/post-lightbox";

const CAPTION_LIMIT = 2200; // Instagram's caption limit
const HASHTAG_LIMIT = 30; // and its hashtag limit

const schema = z
  .object({
    hook: z.string().trim().min(1, "The post needs a headline.").max(60, "Keep the headline under 60 characters so it fits the image."),
    caption: z.string().trim().min(1, "Write a caption before saving.").max(CAPTION_LIMIT, `Captions can be up to ${CAPTION_LIMIT} characters.`),
    hashtags: z.array(z.string()).max(HASHTAG_LIMIT, `Instagram allows up to ${HASHTAG_LIMIT} hashtags.`),
    mediaUrl: z.string().nullable(),
    date: z.string(),
    time: z.string(),
  })
  // A publish time is both halves or neither: a date with no time can't be scheduled.
  .refine((v) => !v.date || !!v.time, { path: ["time"], message: "Add a time, or clear the date." })
  .refine((v) => !v.time || !!v.date, { path: ["date"], message: "Add a date, or clear the time." });
type Values = z.infer<typeof schema>;

const toValues = (post: Post): Values => ({
  hook: post.hook,
  caption: post.caption,
  hashtags: post.hashtags,
  mediaUrl: post.mediaUrl ?? null,
  date: post.scheduledFor ? format(new Date(post.scheduledFor), "yyyy-MM-dd") : "",
  time: post.scheduledFor ? format(new Date(post.scheduledFor), "HH:mm") : "",
});

export function PostSheet({
  post: current,
  brand,
  clientId,
  onClose,
}: {
  post: Post | null;
  brand: BrandKit | undefined;
  clientId: string;
  onClose: () => void;
}) {
  // Keep showing the last post while the sheet animates out after `post` goes null.
  const [post, setPost] = useState(current);
  if (current && current !== post) setPost(current);

  const update = useUpdatePost(clientId);
  const { data: strategy } = useQuery(strategyQuery(clientId));
  const [viewing, setViewing] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { hook: "", caption: "", hashtags: [], mediaUrl: null, date: "", time: "" },
  });

  useEffect(() => {
    if (current) form.reset(toValues(current));
  }, [current, form]);

  const locked = post?.status === "published";
  const live = form.watch();
  const preview = post && { ...post, hook: live.hook || post.hook, mediaUrl: live.mediaUrl };

  async function pickImage(file: File | undefined) {
    if (!file) return;
    try {
      form.setValue("mediaUrl", await readImage(file), { shouldDirty: true });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      // Lets the same file be chosen again after going back to the generated artwork.
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function save(values: Values, status?: Post["status"]) {
    if (!post) return;
    update.mutate(
      {
        postId: post.id,
        patch: {
          hook: values.hook,
          caption: values.caption,
          hashtags: values.hashtags,
          mediaUrl: values.mediaUrl,
          scheduledFor: values.date && values.time ? new Date(`${values.date}T${values.time}`).toISOString() : null,
          ...(status && { status }),
        },
      },
      { onSuccess: () => toast.success(status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Changes saved") },
    );
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
        {post && preview && brand && (
          <div className="grid gap-6">
            <div className="flex gap-4">
              {/* The picture is a button: the obvious thing to do with a thumbnail is open it. */}
              <button
                type="button"
                onClick={() => setViewing(true)}
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
                {!locked && (
                  <div className="flex flex-wrap gap-2">
                    <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => pickImage(e.target.files?.[0])} />
                    <Button type="button" variant="secondary" size="sm" onClick={() => fileInput.current?.click()}>
                      <ImageUp /> {live.mediaUrl ? "Replace image" : "Use your own image"}
                    </Button>
                    {live.mediaUrl && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => form.setValue("mediaUrl", null, { shouldDirty: true })}>
                        <RotateCcw /> Use generated artwork
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <p className="flex gap-2 rounded-md bg-tint p-3 text-[0.8125rem] leading-snug text-tint-foreground">
              <Sparkles className="mt-0.5 size-3.5 shrink-0" />
              {post.aiNote}
            </p>

            {post.metrics && (
              <dl className="grid grid-cols-5 gap-2 rounded-lg bg-secondary p-3 text-center">
                {(Object.entries(post.metrics) as [string, number][]).map(([k, v]) => (
                  <div key={k}>
                    <dd className="type-number text-[1.0625rem]">{formatCompact(v)}</dd>
                    <dt className="type-label capitalize">{k}</dt>
                  </div>
                ))}
              </dl>
            )}

            <Form {...form}>
              <form className="grid gap-5" onSubmit={form.handleSubmit((v) => save(v))}>
                <fieldset disabled={locked} className="grid gap-5 disabled:opacity-70">
                  <FormField control={form.control} name="hook" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Headline on the image</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      {live.mediaUrl && <FormDescription>Shown only on generated artwork. Your own image is used as it is.</FormDescription>}
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="caption" render={({ field }) => (
                    <FormItem>
                      <div className="flex items-baseline justify-between">
                        <FormLabel>Caption</FormLabel>
                        <span className="type-label tabular-nums">{field.value.length} / {CAPTION_LIMIT}</span>
                      </div>
                      <FormControl><Textarea rows={6} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="hashtags" render={({ field }) => (
                    <FormItem>
                      <div className="flex items-baseline justify-between">
                        <FormLabel>Hashtags</FormLabel>
                        <span className="type-label tabular-nums">{field.value.length} / {HASHTAG_LIMIT}</span>
                      </div>
                      <FormControl>
                        <TagInput
                          value={field.value}
                          onChange={field.onChange}
                          normalize={normalizeHashtag}
                          max={HASHTAG_LIMIT}
                          disabled={locked}
                          placeholder="Type a hashtag and press Enter"
                        />
                      </FormControl>
                      <FormDescription>Added after the caption when the post is published.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  {!locked && (
                    <div className="grid grid-cols-2 items-start gap-3">
                      <FormField control={form.control} name="date" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Publish date</FormLabel>
                          {/* Nothing can be scheduled in the past, so earlier days are unavailable. */}
                          <FormControl><DatePicker value={field.value} onChange={field.onChange} min={format(new Date(), "yyyy-MM-dd")} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="time" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Publish time</FormLabel>
                          <FormControl>
                            <TimePicker
                              value={field.value}
                              onChange={field.onChange}
                              suggestions={bestTimesFor(strategy, post.platform)}
                              suggestionsLabel={`Best times for ${PLATFORM_LABEL[post.platform]}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  )}
                </fieldset>
                {/* Lets Enter submit from the single-line fields. */}
                <button type="submit" hidden />
              </form>
            </Form>
          </div>
        )}
      </Sheet>

      {preview && brand && <PostLightbox post={preview} brand={brand} open={viewing} onOpenChange={setViewing} />}
    </>
  );
}
