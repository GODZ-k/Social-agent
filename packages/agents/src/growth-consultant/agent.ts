import { Agent, type ToolsInput } from "@mastra/core/agent";
import { loadSkill } from "../skills.js";
import { GROWTH_CONSULTANT_INSTRUCTIONS } from "./instructions.js";

/** The craft the agent works from, inlined so the research loop spends its calls on tools, not on reading skills. */
const SKILLS = ["business-diagnosis", "growth-levers-by-business-model", "offer-and-funnel", "kpi-selection", "competitor-analysis"];

/**
 * No memory: every run is independent. The app passes the model and the tools (web search and page
 * reading), so another project can plug in its own search without changing the agent.
 */
export function createGrowthConsultant({ model, tools }: { model: string; tools: ToolsInput }): Agent {
  return new Agent({
    id: "growth-consultant",
    name: "Growth Consultant",
    description: "Diagnoses a business from its intake, website and web research, and writes the growth brief the Strategist plans from.",
    instructions: [GROWTH_CONSULTANT_INSTRUCTIONS, ...SKILLS.map((name) => `# Craft notes: ${name}\n\n${loadSkill(name)}`)],
    model,
    tools,
  });
}
