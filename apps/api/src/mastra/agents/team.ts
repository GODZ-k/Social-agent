import { createAccountManager, createAudienceResearcher, createBrandAnalyst, createGrowthConsultant } from "@social-agent/agents";
import { AGENT_MODELS } from "@/mastra/config/models";
import { readPage } from "@/mastra/tools/read-page";
import { webSearch } from "@/mastra/tools/web-search";

// The agents live in packages/agents so other projects can reuse them. Cadence picks each one's
// model and gives the research agents its own tools (Firecrawl, behind the address-safety check).
const researchTools = { webSearch, readPage };

export const brandAnalyst = createBrandAnalyst({ model: AGENT_MODELS["brand-analyst"] });
export const growthConsultant = createGrowthConsultant({ model: AGENT_MODELS["growth-consultant"], tools: researchTools });
export const audienceResearcher = createAudienceResearcher({ model: AGENT_MODELS["audience-researcher"], tools: researchTools });
export const accountManager = createAccountManager({ model: AGENT_MODELS["account-manager"] });
