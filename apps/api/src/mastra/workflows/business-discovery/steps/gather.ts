import { createStep } from "@mastra/core/workflows";
import { brandContextSchema } from "@social-agent/shared";

// The database reads happen in run.ts, before the workflow starts: a workflow step must not
// reach a repository. This step keeps the `gather` id alive for the progress screen and checks
// that what run.ts passed in still has the shape the agents expect.
export const gatherStep = createStep({
  id: "gather",
  description: "Check the brand kit, the questionnaire answers, the site facts and any previous research gathered for this run.",
  inputSchema: brandContextSchema,
  outputSchema: brandContextSchema,
  execute: async ({ inputData }) => brandContextSchema.parse(inputData),
});
