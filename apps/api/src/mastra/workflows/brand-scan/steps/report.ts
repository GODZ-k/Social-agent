import { createStep } from "@mastra/core/workflows";
import { SCAN_MESSAGES, scanOutcomeSchema, type ScanOutcome } from "../../../../scan/types";
import { interpretOutputSchema } from "../schemas";

export const reportStep = createStep({
  id: "report",
  description: "Return the result, the pages read and the warnings.",
  inputSchema: interpretOutputSchema,
  outputSchema: scanOutcomeSchema,
  execute: async ({ inputData }): Promise<ScanOutcome> => {
    if (inputData.failure) return { ok: false, ...inputData.failure };
    if (!inputData.result) return { ok: false, code: "INTERPRETATION_FAILED", message: SCAN_MESSAGES.INTERPRETATION_FAILED };

    return { ok: true, result: inputData.result, pages: inputData.pages, warnings: inputData.warnings };
  },
});
