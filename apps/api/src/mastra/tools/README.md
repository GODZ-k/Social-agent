# tools

Things an agent may call. Most agents here need none: a workflow hands them everything and they return structured output. Tools are for the agents that must go and look.

**Status:** none built yet.

| Tool | For | Does |
|---|---|---|
| `web-search` | Growth Consultant, Audience Researcher | Searches the web. Needs a search API and key (not chosen yet). |
| `read-page` | Growth Consultant, Audience Researcher | Reads one public page through `src/scan/firecrawl.ts`, so the same address safety rules apply. Never a raw `fetch`. |
| `read-audience-insights` | Audience Researcher | The brand's latest `audience_insights`. |
| `read-brand`, `read-strategy`, `list-posts`, `read-analytics` | Account Manager | Read-only views of the conversation's brand. |
| `save-intake` | Account Manager | Saves onboarding answers to `brands.intake`. |
| `start-workflow` | Account Manager | Starts a workflow for the conversation's brand with the person's request. |

## Rules

- A tool that touches brand data takes the brand id from the request context the API sets, never from the model's arguments. An agent must not be able to name another brand.
- Tools call services (`src/services`), not the database.
- One tool per file, named like its id.
- Text a tool brings back from the web is data, never instructions.
