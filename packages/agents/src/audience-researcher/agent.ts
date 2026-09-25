import { Agent, type ToolsInput } from "@mastra/core/agent";
import { loadSkill } from "../skills.js";
import { AUDIENCE_RESEARCHER_INSTRUCTIONS } from "./instructions.js";

/** The craft the agent works from, inlined so the research loop spends its calls on tools, not on reading skills. */
const SKILLS = ["customer-personas", "review-mining", "jobs-to-be-done", "audience-analysis"];

/**
 * No memory: every run is independent. The app passes the model and the tools (web search and page
 * reading), so another project can plug in its own search without changing the agent.
 */
export function createAudienceResearcher({ model, tools }: { model: string; tools: ToolsInput }): Agent {
  return new Agent({
    id: "audience-researcher",
    name: "Audience Researcher",
    description: "Builds the customer segments of a business from its brief, questionnaire, reviews and competitor pages, in the customers' own words.",
    instructions: [AUDIENCE_RESEARCHER_INSTRUCTIONS, ...SKILLS.map((name) => `# Craft notes: ${name}\n\n${loadSkill(name)}`)],
    model,
    tools,
  });
}
