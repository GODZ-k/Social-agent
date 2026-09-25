# @social-agent/agents

The product's agent know-how, kept apart from any one app so it can be reused in other projects (client SEO work, website rebuilds). Cadence's API is its first user.

| Path | What |
|---|---|
| `skills/<name>/SKILL.md` | One playbook per field (brand voice, content pillars, hashtags, ...), in the portable Agent Skills format |
| `src/skills.ts` | `loadSkill(name)`: a skill's body, to inline into an agent's instructions |
| `src/prompt-text.ts` | `asDataBlock`, `cleanText`: outside text goes to a model only inside a data block |
| `src/structured.ts` | `generateStructured`: one structured-output call per agent, retried once only for a bad answer |
| `src/brand-analyst/` | `createBrandAnalyst({ model })`: the brand kit from a website's facts |
| `src/growth-consultant/` | `createGrowthConsultant({ model, tools })`: the growth brief |
| `src/audience-researcher/` | `createAudienceResearcher({ model, tools })`: the audience profile |
| `src/account-manager/` | `createAccountManager({ model })`: the questionnaire questions and their review, `checkQuestionnaireQuestions`, `QUESTIONNAIRE_LIMITS` |

Every built agent lives here since 2026-09-25; the rest (Strategist, Copywriter, Art Director, Editor, Performance Analyst) are built here too. Each is a factory: **the app passes the model and, for research agents, the tools**, so another project picks its own models and its own search. An agent's input is data the app loads, usually the shared `BrandContext` (`packages/shared`): brand kit, approved questionnaire, site facts, latest research. No agent reads a database.

```ts
// apps/api/src/mastra/agents/team.ts: Cadence's wiring
export const growthConsultant = createGrowthConsultant({ model: AGENT_MODELS["growth-consultant"], tools: { webSearch, readPage } });
```

## Rules

- Nothing in this package imports app code (Express, repositories, the database, an app's config). An agent depends only on its own input and output schemas, its skills and its model choice.
- Skills are written for the field, not for Cadence's screens.
- An app that bundles this package (the API's tsup build) must copy `skills/` next to its bundle; `apps/api/scripts/copy-skills.mjs` does that.

These are not the Claude Code skills in the repo root's `.agents/skills/`. Those are tools for whoever builds the repo; these are what the product's agents know at run time.
