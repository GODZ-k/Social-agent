import { createStep } from "@mastra/core/workflows";
import { audienceProfileSchema } from "@social-agent/shared";
import { renderProfileInput } from "@social-agent/agents";
import { audienceResearcher } from "@/mastra/agents/team";
import { askResearchAgent } from "@/mastra/workflows/business-discovery/research-agent";
import { RESEARCH_FAILURE, diagnoseOutputSchema, profileOutputSchema } from "@/mastra/workflows/business-discovery/schemas";

export const profileStep = createStep({
  id: "profile",
  description: "The Audience Researcher reads the brief, researches the customers and writes the audience profile.",
  inputSchema: diagnoseOutputSchema,
  outputSchema: profileOutputSchema,
  execute: async ({ inputData, requestContext, mastra }) => {
    const { input, brief } = inputData;
    if (inputData.failure || !brief) return { failure: inputData.failure };

    const prompt = renderProfileInput(input, brief);
    const logger = mastra?.getLogger();
    const profile = await askResearchAgent("profile", audienceResearcher, prompt, audienceProfileSchema, { requestContext, logger });
    if (!profile) return { brief, failure: RESEARCH_FAILURE };
    return { brief, profile };
  },
});
