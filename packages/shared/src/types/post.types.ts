import type { z } from "zod";
import type {
  mediaSourceSchema,
  mediaTypeSchema,
  postArtSchema,
  postFormatSchema,
  postStatusSchema,
} from "../schema/post.schema.js";

export type PostFormat = z.infer<typeof postFormatSchema>;
export type PostStatus = z.infer<typeof postStatusSchema>;
export type MediaType = z.infer<typeof mediaTypeSchema>;
export type MediaSource = z.infer<typeof mediaSourceSchema>;
export type PostArt = z.infer<typeof postArtSchema>;
