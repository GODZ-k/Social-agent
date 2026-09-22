import { z } from "zod";
import { format } from "date-fns";
import type { Post, PostPatch, PostStatus } from "@/lib/types";

export const CAPTION_LIMIT = 2200; // Instagram's caption limit
export const HASHTAG_LIMIT = 30; // and its hashtag limit

export const schema = z
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

export type Values = z.infer<typeof schema>;

export const toValues = (post: Post): Values => ({
  hook: post.hook,
  caption: post.caption,
  hashtags: post.hashtags,
  mediaUrl: post.mediaUrl ?? null,
  date: post.scheduledFor ? format(new Date(post.scheduledFor), "yyyy-MM-dd") : "",
  time: post.scheduledFor ? format(new Date(post.scheduledFor), "HH:mm") : "",
});

/** The edit as the API takes it; a decision from the footer rides along with it. */
export function toPatch(values: Values, status?: PostStatus): PostPatch {
  return {
    hook: values.hook,
    caption: values.caption,
    hashtags: values.hashtags,
    mediaUrl: values.mediaUrl,
    scheduledFor: values.date && values.time ? new Date(`${values.date}T${values.time}`).toISOString() : null,
    ...(status && { status }),
  };
}
