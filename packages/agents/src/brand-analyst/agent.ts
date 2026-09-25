import { Agent } from "@mastra/core/agent";
import { loadSkill } from "../skills.js";
import { BRAND_ANALYST_INSTRUCTIONS } from "./instructions.js";

/**
 * No memory and no tools: every scan is independent and is answered in one model call. The app
 * passes the model, so the agent carries no app config and can be reused elsewhere.
 */
export function createBrandAnalyst({ model }: { model: string }): Agent {
  return new Agent({
    id: "brand-analyst",
    name: "Brand Analyst",
    description: "Turns the facts our scanner extracted from a business's website into a draft brand kit.",
    instructions: [BRAND_ANALYST_INSTRUCTIONS, `# Craft notes: brand voice\n\n${loadSkill("brand-voice")}`],
    model,
  });
}
