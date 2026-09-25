import { createStep } from "@mastra/core/workflows";
import { renderDiscoveryInput } from "@social-agent/agents";
import { brandContextSchema, growthBriefSchema } from "@social-agent/shared";
import { growthConsultant } from "../../../agents/team";
import { askResearchAgent } from "../research-agent";
import { RESEARCH_FAILURE, diagnoseOutputSchema } from "../schemas";

export const diagnoseStep = createStep({
  id: "diagnose",
  description: "The Growth Consultant researches the market and the competitors and writes the growth brief.",
  inputSchema: brandContextSchema,
  outputSchema: diagnoseOutputSchema,
  execute: async ({ inputData, requestContext, mastra }) => {
    const brief = await askResearchAgent("diagnose", growthConsultant, renderDiscoveryInput(inputData), growthBriefSchema, {
      requestContext,
      logger: mastra?.getLogger(),
    });
    if (!brief) return { input: inputData, failure: RESEARCH_FAILURE };
    return { input: inputData, brief };
  },
});
