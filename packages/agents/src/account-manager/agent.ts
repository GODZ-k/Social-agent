import { Agent } from "@mastra/core/agent";
import { loadSkill } from "../skills.js";
import { ACCOUNT_MANAGER_INSTRUCTIONS } from "./instructions.js";

/** The app passes the model, so the agent carries no app config and can be reused elsewhere. */
export function createAccountManager({ model }: { model: string }): Agent {
  return new Agent({
    id: "account-manager",
    name: "Account Manager",
    description: "Talks with the business owner: runs the intake interview and reviews the answers before research.",
    instructions: [ACCOUNT_MANAGER_INSTRUCTIONS, `# Craft notes: intake interview\n\n${loadSkill("intake-interview")}`],
    model,
  });
}
