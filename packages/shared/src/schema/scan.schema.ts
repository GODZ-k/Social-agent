import { z } from "zod";
import { brandKitSchema, businessInfoSchema } from "./brand.schema.js";

export const scanStatusSchema = z.enum(["queued", "running", "done", "failed"]);

/** A page the agent read while scanning a website. */
export const scanPageSchema = z.object({
  url: z.string(),
  title: z.string(),
});

/** What a scan proposes. The person reviews it before a brand is created from it. */
export const scanResultSchema = z.object({
  name: z.string().optional(),
  industry: z.string().optional(),
  brand: brandKitSchema,
  business: businessInfoSchema.optional(),
});

export type ScanStatus = z.infer<typeof scanStatusSchema>;
export type ScanPage = z.infer<typeof scanPageSchema>;
export type ScanResult = z.infer<typeof scanResultSchema>;
