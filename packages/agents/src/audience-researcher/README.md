# Audience Researcher

**Field:** Understanding the people the business sells to.

**Status:** built 2026-09-22 (`agent.ts`, `instructions.ts`, `output.schema.ts`, `prompt.ts`); registered in `mastra/index.ts`. Probed on real calls with `apps/api/testing/discovery-probe.ts`. `read-audience-insights` waits for phase 5; until then the profile's `followerGap` says accounts are not connected. Lives in `packages/agents` since 2026-09-25 as `createAudienceResearcher({ model, tools })`; Cadence builds it in `apps/api/src/mastra/agents/team.ts`.

## Responsible for

- Builds 2 to 4 real customer segments: what each wants, fears and objects to, and what triggers a purchase.
- Collects the customers' own words from reviews and testimonials. The best hooks are written in that language.
- Says where each segment spends time and when they are online, using `audience_insights` once accounts are connected.
- Compares who follows the brand today with who the business wants, and names the gap.
- Looks at who engages with competitors and what they respond to.

## Not responsible for

- Decide business goals. It reads them from the growth brief.
- Invent demographics. With no data it says so and marks the segment as a hypothesis.

## Reads

The growth brief, brand kit, questionnaire answers, public reviews, competitor pages, and `audience_insights` when present.

## Returns

An **audience profile**: segments with pains, desires, objections, language, platforms and the content each responds to, each marked as evidence-based or hypothesis. Stored as a `brand_research` row of kind `audience_profile`.

Returned as structured output validated by a zod schema, so a workflow can rely on its shape.

## Skills

- `skills/customer-personas`
- `skills/review-mining`
- `skills/jobs-to-be-done`
- `skills/audience-analysis`

## Tools

- `tools/web-search`
- `tools/read-page`
- `tools/read-audience-insights`

## Model

`MODELS.expert` (deep reasoning; the judgement here is worth the cost). Set in `config/models.ts`, never in the agent file.

## Runs inside

- `workflows/business-discovery`

## Files when built

- `agent.ts`: the `Agent` (id `audience-researcher`, model, skills, tools). Registered in `mastra/index.ts`.
- `instructions.ts`: who the agent is and what it must return. Short. The craft knowledge lives in the skills.
- `output.schema.ts`: the zod schema of what it returns, unless that shape already exists in `@social-agent/shared`.
