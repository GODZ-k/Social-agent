import { createStep } from "@mastra/core/workflows";
import { audienceProfileSchema } from "@social-agent/shared";
import { renderProfileInput } from "@social-agent/agents";
import { audienceResearcher } from "../../../agents/team";
import { askResearchAgent } from "../research-agent";
import { RESEARCH_FAILURE, diagnoseOutputSchema, profileOutputSchema } from "../schemas";

export const profileStep = createStep({
  id: "profile",
  description: "The Audience Researcher reads the brief, researches the customers and writes the audience profile.",
  inputSchema: diagnoseOutputSchema,
  outputSchema: profileOutputSchema,
  execute: async ({ inputData, requestContext, mastra }) => {
    const { input, brief } = inputData;
    if (inputData.failure || !brief) return { failure: inputData.failure };

    const profile = await askResearchAgent("profile", audienceResearcher, renderProfileInput(input, brief), audienceProfileSchema, {
      requestContext,
      logger: mastra?.getLogger(),
    });
    if (!profile) return { brief, failure: RESEARCH_FAILURE };
    return { brief, profile };
  },
});
