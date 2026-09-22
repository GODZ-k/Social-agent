import { z } from "zod";
import { brandKitSchema, businessInfoSchema, websiteUrlSchema } from "./brand.schema.js";

export const scanStatusSchema = z.enum(["queued", "running", "done", "failed"]);

/** The workflow's step ids, in order. The scan screen shows a label per id. */
export const scanStepIdSchema = z.enum(["discover", "read-pages", "interpret", "report"]);

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

export const newScanSchema = z.object({ url: websiteUrlSchema });

/** One scan as the API returns it. `result` is set when done, `error` when failed. */
export const scanSchema = z.object({
  id: z.uuid(),
  brandId: z.uuid().nullable(),
  url: z.string(),
  status: scanStatusSchema,
  currentStep: scanStepIdSchema.nullable(),
  pages: z.array(scanPageSchema),
  result: scanResultSchema.nullable(),
  error: z.string().nullable(),
  startedAt: z.string().nullable(),
  finishedAt: z.string().nullable(),
  createdAt: z.string(),
});

export type ScanStatus = z.infer<typeof scanStatusSchema>;
export type ScanStepId = z.infer<typeof scanStepIdSchema>;
export type ScanPage = z.infer<typeof scanPageSchema>;
export type ScanResult = z.infer<typeof scanResultSchema>;
export type NewScanInput = z.infer<typeof newScanSchema>;
export type Scan = z.infer<typeof scanSchema>;
