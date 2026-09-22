import { Agent } from "@mastra/core/agent";
import { AGENT_MODELS } from "../../config/models";
import { loadSkill } from "../../config/skills";
import { BRAND_ANALYST_INSTRUCTIONS } from "./instructions";

// No memory and no tools: every scan is independent and is answered in one model call.
export const brandAnalyst = new Agent({
  id: "brand-analyst",
  name: "Brand Analyst",
  description: "Turns the facts our scanner extracted from a business's website into a draft brand kit.",
  instructions: [BRAND_ANALYST_INSTRUCTIONS, `# Craft notes: brand voice\n\n${loadSkill("brand-voice")}`],
  model: AGENT_MODELS["brand-analyst"],
});
