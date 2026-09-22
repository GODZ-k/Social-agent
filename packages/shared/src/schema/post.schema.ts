import { z } from "zod";

export const postFormatSchema = z.enum(["image", "carousel", "reel", "story"]);

export const postStatusSchema = z.enum(["draft", "in_review", "approved", "scheduled", "published", "rejected"]);

export const mediaTypeSchema = z.enum(["image", "video"]);

/** Whether a person uploaded the file or the agent made it. */
export const mediaSourceSchema = z.enum(["uploaded", "generated"]);

/** Seed for the artwork the UI draws while a post has no media: layout variant + index into the brand colours. */
export const postArtSchema = z.object({
  variant: z.number().int(),
  colorIndex: z.number().int(),
});

export type PostFormat = z.infer<typeof postFormatSchema>;
export type PostStatus = z.infer<typeof postStatusSchema>;
export type MediaType = z.infer<typeof mediaTypeSchema>;
export type MediaSource = z.infer<typeof mediaSourceSchema>;
export type PostArt = z.infer<typeof postArtSchema>;
