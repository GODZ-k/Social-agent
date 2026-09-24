import { createWorkflow } from "@mastra/core/workflows";
import { scanOutcomeSchema } from "@/scan/types";
import { scanInputSchema } from "./schemas";
import { discoverStep } from "./steps/discover";
import { interpretStep } from "./steps/interpret";
import { readPagesStep } from "./steps/read-pages";
import { reportStep } from "./steps/report";

// A website address in, a proposed brand kit and business info out. See ./README.md.
// The rest of the API calls runBrandScan (./run.ts), never this workflow directly.
export const brandScanWorkflow = createWorkflow({
  id: "brand-scan",
  description: "Reads a business's website and proposes its brand kit and business info.",
  inputSchema: scanInputSchema,
  outputSchema: scanOutcomeSchema,
})
  .then(discoverStep)
  .then(readPagesStep)
  .then(interpretStep)
  .then(reportStep)
  .commit();
