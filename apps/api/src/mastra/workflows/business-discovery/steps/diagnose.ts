import { createStep } from "@mastra/core/workflows";
import { renderDiscoveryInput } from "@social-agent/agents";
import { brandContextSchema, growthBriefSchema } from "@social-agent/shared";
import { growthConsultant } from "@/mastra/agents/team";
import { askResearchAgent } from "@/mastra/workflows/business-discovery/research-agent";
import { RESEARCH_FAILURE, diagnoseOutputSchema } from "@/mastra/workflows/business-discovery/schemas";

export const diagnoseStep = createStep({
  id: "diagnose",
  description: "The Growth Consultant researches the market and the competitors and writes the growth brief.",
  inputSchema: brandContextSchema,
  outputSchema: diagnoseOutputSchema,
  execute: async ({ inputData, requestContext, mastra }) => {
    const prompt = renderDiscoveryInput(inputData);
    const logger = mastra?.getLogger();
    const brief = await askResearchAgent("diagnose", growthConsultant, prompt, growthBriefSchema, { requestContext, logger });
    if (!brief) return { input: inputData, failure: RESEARCH_FAILURE };
    return { input: inputData, brief };
  },
});
