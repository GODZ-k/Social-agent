import { createStep } from "@mastra/core/workflows";
import { readSite } from "../../../../scan/index";
import { ScanError } from "../../../../scan/types";
import { discoverOutputSchema, readPagesOutputSchema } from "../schemas";

export const readPagesStep = createStep({
  id: "read-pages",
  description: "Read the picked pages through Firecrawl and extract the facts from every page.",
  inputSchema: discoverOutputSchema,
  outputSchema: readPagesOutputSchema,
  execute: async ({ inputData }) => {
    if (inputData.failure || !inputData.discovery) return { failure: inputData.failure, warnings: [] };
    try {
      return await readSite(inputData.discovery, inputData.deadline);
    } catch (error) {
      if (error instanceof ScanError) return { failure: { code: error.code, message: error.message }, warnings: [] };
      throw error;
    }
  },
});
