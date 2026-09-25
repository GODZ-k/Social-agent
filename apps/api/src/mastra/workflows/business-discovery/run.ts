import { RequestContext } from "@mastra/core/request-context";
import type { ResearchStepId } from "@social-agent/shared";
import { BrandContextService } from "@/services/brand-context.service";
import { newResearchBudget } from "@/mastra/tools/research-budget";
import { mastra } from "@/mastra/index";
import { RESEARCH_MESSAGES, RESEARCH_STEP_IDS, discoveryOutcomeSchema, type DiscoveryOutcome } from "./schemas";

// Lives apart from workflow.ts: this file imports the Mastra instance, and mastra/index.ts
// imports workflow.ts. In one file that is a circular import across a top-level await.

export type { DiscoveryOutcome } from "./schemas";

export type RunBusinessDiscoveryOptions = {
  /** Called as each step starts. The research queue writes research_runs.current_step from here. */
  onStep?: (step: ResearchStepId) => void | Promise<void>;
};

/**
 * The one way the rest of the API runs business discovery. Expected failures (no questionnaire, a model
 * answer rejected twice) are returned, never thrown, so a caller can store them. The research
 * queue stores the brief and the profile; this function writes nothing.
 */
export async function runBusinessDiscovery(brandId: string, options: RunBusinessDiscoveryOptions = {}): Promise<DiscoveryOutcome> {
  // A brand without an approved questionnaire has no context: the endpoint refuses such a run, so this is a second guard.
  const inputData = await BrandContextService.load(brandId);
  if (!inputData) return { ok: false, code: "QUESTIONNAIRE_REQUIRED", message: RESEARCH_MESSAGES.QUESTIONNAIRE_REQUIRED };

  // One budget per run: the tools count searches and page reads against it and collect the sources.
  // Untyped on purpose: a workflow run takes a plain RequestContext; the tools check the value.
  const requestContext = new RequestContext();
  const budget = newResearchBudget();
  requestContext.set("budget", budget);

  const run = await mastra.getWorkflow("businessDiscoveryWorkflow").createRun();
  const stream = run.stream({ inputData, requestContext });

  for await (const chunk of stream.fullStream) {
    if (chunk.type !== "workflow-step-start") continue;
    const step = chunk.payload.id as ResearchStepId;
    if (RESEARCH_STEP_IDS.includes(step)) await options.onStep?.(step);
  }

  const result = await stream.result;
  if (result.status !== "success") {
    // A bug or an infrastructure failure, not a research outcome: let the caller's error handling see it.
    throw new Error(`business-discovery workflow ended with status "${result.status}"`, {
      cause: result.status === "failed" ? result.error : undefined,
    });
  }
  return discoveryOutcomeSchema.parse(result.result);
}
