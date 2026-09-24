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
