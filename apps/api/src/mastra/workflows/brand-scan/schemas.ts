import { z } from "zod";
import { scanPageSchema, scanResultSchema } from "@social-agent/shared";
import { discoverySchema, scanErrorCodeSchema, siteFactsSchema } from "@/scan/types";

// A step never throws a scan failure: it returns it, and the steps after it pass it along.
// Step outputs are stored in Postgres, which would reduce a thrown ScanError to a message.
export const failureSchema = z.object({ code: scanErrorCodeSchema, message: z.string() });

export const scanInputSchema = z.object({ url: z.string() });

export const discoverOutputSchema = z.object({
  failure: failureSchema.optional(),
  deadline: z.number(),
  discovery: discoverySchema.optional(),
});

export const readPagesOutputSchema = z.object({
  failure: failureSchema.optional(),
  facts: siteFactsSchema.optional(),
  warnings: z.array(z.string()),
});

export const interpretOutputSchema = z.object({
  failure: failureSchema.optional(),
  result: scanResultSchema.optional(),
  pages: z.array(scanPageSchema),
  warnings: z.array(z.string()),
});
