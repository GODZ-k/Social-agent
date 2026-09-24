import type { ScanStepId } from "@social-agent/shared";
import { config } from "../../../config/constants";
import { normaliseScanUrl } from "../../../scan/normalise-url";
import { SCAN_STEP_IDS, scanOutcomeSchema, type ScanOutcome } from "../../../scan/types";
import { mastra } from "../../index";

// Lives apart from workflow.ts: this file imports the Mastra instance, and mastra/index.ts
// imports workflow.ts. In one file that is a circular import across a top-level await.

export type RunBrandScanOptions = {
  /** Called as each step starts. Phase 2 writes brand_scans.current_step from here. */
  onStep?: (step: ScanStepId) => void | Promise<void>;
};

/**
 * The one way the rest of the API runs a brand scan. Expected failures (a bad address, an unreachable
 * site, no readable text) are returned, never thrown, so a caller can store them.
 */
export async function runBrandScan(input: string, options: RunBrandScanOptions = {}): Promise<ScanOutcome> {
  const candidate = normaliseScanUrl(input);
  if (!URL.canParse(candidate)) return { ok: false, code: "INVALID_URL", message: config.scan.MESSAGES.INVALID_URL };

  const run = await mastra.getWorkflow("brandScanWorkflow").createRun();
  const stream = run.stream({ inputData: { url: candidate } });

  for await (const chunk of stream.fullStream) {
    if (chunk.type !== "workflow-step-start") continue;
    const step = chunk.payload.id as ScanStepId;
    if (SCAN_STEP_IDS.includes(step)) await options.onStep?.(step);
  }

  const result = await stream.result;
  if (result.status !== "success") {
    // A bug or an infrastructure failure, not a scan outcome: let the caller's error handling see it.
    throw new Error(`brand-scan workflow ended with status "${result.status}"`, {
      cause: result.status === "failed" ? result.error : undefined,
    });
  }
  return scanOutcomeSchema.parse(result.result);
}
