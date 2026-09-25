import { createWorkflow } from "@mastra/core/workflows";
import { brandContextSchema } from "@social-agent/shared";
import { discoveryOutcomeSchema } from "./schemas";
import { diagnoseStep } from "./steps/diagnose";
import { gatherStep } from "./steps/gather";
import { profileStep } from "./steps/profile";
import { saveStep } from "./steps/save";

// The brand kit, the questionnaire answers and the site facts in; a growth brief and an audience
// profile out. See ./README.md. The rest of the API calls runBusinessDiscovery (./run.ts),
// never this workflow directly.
export const businessDiscoveryWorkflow = createWorkflow({
  id: "business-discovery",
  description: "Researches a business and its customers and writes the growth brief and the audience profile.",
  inputSchema: brandContextSchema,
  outputSchema: discoveryOutcomeSchema,
})
  .then(gatherStep)
  .then(diagnoseStep)
  .then(profileStep)
  .then(saveStep)
  .commit();
