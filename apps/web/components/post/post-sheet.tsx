"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useUpdatePost } from "@/lib/api/queries";
import type { BrandKit, Post } from "@/lib/types";
import { formatCompact } from "@/lib/utils";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FORMAT_LABEL, PLATFORM_LABEL, PlatformIcon, StatusBadge } from "./platform";
import { PostArt } from "./post-art";

const CAPTION_LIMIT = 2200; // Instagram's caption limit

const schema = z.object({
  hook: z.string().trim().min(1, "The post needs a headline.").max(60, "Keep the headline under 60 characters so it fits the image."),
  caption: z.string().trim().min(1, "Write a caption before saving.").max(CAPTION_LIMIT, `Captions can be up to ${CAPTION_LIMIT} characters.`),
  scheduledFor: z.string().refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "Pick a valid date and time."),
});
type Values = z.infer<typeof schema>;

const toLocalInput = (iso: string | null) => (iso ? format(new Date(iso), "yyyy-MM-dd'T'HH:mm") : "");

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
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { hook: "", caption: "", scheduledFor: "" },
  });

  useEffect(() => {
    if (current) form.reset({ hook: current.hook, caption: current.caption, scheduledFor: toLocalInput(current.scheduledFor) });
  }, [current, form]);

  const locked = post?.status === "published";
  const live = form.watch();

  function save(values: Values, status?: Post["status"]) {
    if (!post) return;
    update.mutate(
      {
        postId: post.id,
        patch: {
          hook: values.hook,
          caption: values.caption,
          scheduledFor: values.scheduledFor ? new Date(values.scheduledFor).toISOString() : null,
          ...(status && { status }),
        },
      },
      { onSuccess: () => toast.success(status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Changes saved") },
    );
    onClose();
  }

  return (
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
      {post && brand && (
        <div className="grid gap-6">
          <div className="flex gap-4">
            <PostArt post={{ ...post, hook: live.hook || post.hook }} brand={brand} className="w-32 shrink-0 self-start shadow-raised" />
            <div className="grid min-w-0 content-start gap-2.5">
              <StatusBadge status={post.status} />
              <p className="flex items-center gap-1.5 text-sm">
                <PlatformIcon platform={post.platform} className="text-muted-foreground" />
                {PLATFORM_LABEL[post.platform]}
              </p>
              <p className="flex gap-2 rounded-md bg-tint p-3 text-[0.8125rem] leading-snug text-tint-foreground">
                <Sparkles className="mt-0.5 size-3.5 shrink-0" />
                {post.aiNote}
              </p>
            </div>
          </div>

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
                    <FormDescription>{post.hashtags.join(" ")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                {!locked && (
                  <FormField control={form.control} name="scheduledFor" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publish time</FormLabel>
                      <FormControl><Input type="datetime-local" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
              </fieldset>
              {/* Lets Enter submit from the single-line fields. */}
              <button type="submit" hidden />
            </form>
          </Form>
        </div>
      )}
    </Sheet>
  );
}
