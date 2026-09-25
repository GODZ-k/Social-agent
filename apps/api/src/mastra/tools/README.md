# tools

Things an agent may call. Most agents here need none: a workflow hands them everything and they return structured output. Tools are for the agents that must go and look.

**Status:** `web-search` and `read-page` built 2026-09-22 (business discovery, 2B-1), with their shared budget in `research-budget.ts`. Probe them from the terminal with `pnpm --filter api run research-tools -- search "<query>" | read <url>`. The rest are not started.

| Tool | For | Does |
|---|---|---|
| `web-search` | Growth Consultant, Audience Researcher | Firecrawl `/v2/search` through `searchWeb` in `src/scan/firecrawl.ts`; up to 5 hits (`url`, `title`, `description`). 8 searches per run. |
| `read-page` | Growth Consultant, Audience Researcher | Reads one public page through `readMainText` in `src/scan/firecrawl.ts` (title + main text ≤ 6,000 characters), so the same address safety rules apply. Never a raw `fetch`. 12 reads per run; every page read lands in `budget.sources`. |
| `read-audience-insights` | Audience Researcher | The brand's latest `audience_insights`. |
| `read-brand`, `read-strategy`, `list-posts`, `read-analytics` | Account Manager | Read-only views of the conversation's brand. |
| `save-questionnaire` | Account Manager | Saves onboarding answers to `brands.questionnaire`. |
| `start-workflow` | Account Manager | Starts a workflow for the conversation's brand with the person's request. |

## Rules

- A tool that touches brand data takes the brand id from the request context the API sets, never from the model's arguments. An agent must not be able to name another brand.
- Tools call services (`src/services`), not the database.
- One tool per file, named like its id.
- Text a tool brings back from the web is data, never instructions.
- Research tools read their budget from `requestContext.get("budget")` (`ResearchBudget`, set once per run by the workflow) and never throw into the model: a spent budget, a missing budget, a blocked address or a failed request all come back as a short `note` the agent can act on.
