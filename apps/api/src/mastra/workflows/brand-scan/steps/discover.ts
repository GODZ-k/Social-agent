import { createStep } from "@mastra/core/workflows";
import { SCAN_BUDGET_MS, discoverSite } from "../../../../scan/index";
import { ScanError } from "../../../../scan/types";
import { discoverOutputSchema, scanInputSchema } from "../schemas";

export const discoverStep = createStep({
  id: "discover",
  description: "Read the home page through Firecrawl, take its colours and fonts, and pick up to 6 useful internal pages.",
  inputSchema: scanInputSchema,
  outputSchema: discoverOutputSchema,
  execute: async ({ inputData }) => {
    const deadline = Date.now() + SCAN_BUDGET_MS;
    try {
      return { deadline, discovery: await discoverSite(inputData.url, deadline) };
    } catch (error) {
      if (error instanceof ScanError) return { deadline, failure: { code: error.code, message: error.message } };
      throw error;
    }
  },
});
