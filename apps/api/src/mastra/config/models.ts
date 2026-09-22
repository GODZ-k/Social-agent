/**
 * Every model id the agents use. Change a model here, never inside an agent.
 * Ids are Mastra model-router strings ("provider/model"). Before changing one, check it exists:
 *   node .agents/skills/mastra/scripts/provider-registry.mjs --provider anthropic
 */
export const MODELS = {
    /** Deep reasoning, where a better answer is worth the cost: diagnosis, strategy, the quality gate, analysis. */
    expert: "anthropic/claude-opus-5",
    /** Craft work at volume: writing, visual direction, interpreting a website, chat. */
    standard: "anthropic/claude-sonnet-5",
    /** Small, frequent jobs: model-graded scorers, classification. */
    fast: "anthropic/claude-haiku-4-5",
} as const;

export type ModelTier = keyof typeof MODELS;

/** Which tier each specialist runs on. The reasons are in each agent's README. */
export const AGENT_MODELS = {
    "brand-analyst": MODELS.standard,
    "growth-consultant": MODELS.expert,
    "audience-researcher": MODELS.expert,
    strategist: MODELS.expert,
    copywriter: MODELS.standard,
    "art-director": MODELS.standard,
    editor: MODELS.expert,
    "performance-analyst": MODELS.expert,
    "account-manager": MODELS.standard,
} as const satisfies Record<string, (typeof MODELS)[ModelTier]>;

export type AgentId = keyof typeof AGENT_MODELS;
