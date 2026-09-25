import type { RequestContext } from "@mastra/core/request-context";
import { createStep } from "@mastra/core/workflows";
import { budgetFrom } from "@/mastra/tools/research-budget";
import { RESEARCH_FAILURE, discoveryOutcomeSchema, profileOutputSchema, type DiscoveryOutcome } from "@/mastra/workflows/business-discovery/schemas";

/** The URLs the tools read during this run, in the order they were read. */
function sourcesOf(requestContext: RequestContext): string[] {
  const budget = budgetFrom(requestContext);
  return budget ? [...budget.sources] : [];
}

// Named "save" for the progress screen, but the rows are written by the research queue: the
// workflow stays free of the database, so it can run from a terminal without one.
export const saveStep = createStep({
  id: "save",
  description: "Return the brief, the profile and the pages read. The research queue stores them as the next versions.",
  inputSchema: profileOutputSchema,
  outputSchema: discoveryOutcomeSchema,
  execute: async ({ inputData, requestContext }): Promise<DiscoveryOutcome> => {
    if (inputData.failure) return { ok: false, ...inputData.failure };
    if (!inputData.brief || !inputData.profile) return { ok: false, ...RESEARCH_FAILURE };

    return { ok: true, brief: inputData.brief, profile: inputData.profile, sources: sourcesOf(requestContext) };
  },
});
