# Growth Consultant

**Field:** Diagnosing a business and deciding how social media can grow it.

**Status:** built 2026-09-22 (`agent.ts`, `instructions.ts`, `output.schema.ts`, `prompt.ts`); registered in `mastra/index.ts`. Probed on real calls with `apps/api/testing/discovery-probe.ts`. The skills it inlines are being written (Task 5 of the discovery plan). Lives in `packages/agents` since 2026-09-25 as `createGrowthConsultant({ model, tools })`; Cadence builds it in `apps/api/src/mastra/agents/team.ts`.

## Responsible for

- Works out the business model: what is sold, to whom, and how money is made (footfall, bookings, online orders, leads, repeat customers).
- Finds the bottleneck: awareness, trust, conversion, repeat purchase or order value.
- Chooses the growth lever social media should pull, and the offers worth pushing (best sellers, high margin, seasonal, spare capacity).
- Sets success measures tied to business results, not follower counts.
- Reads the competitors and names the opening.

## Not responsible for

- Choose pillars, cadence or platforms. That is the Strategist, working from this brief.
- Guess facts the owner must supply (margins, capacity, order value). It lists them as open questions instead.

## Reads

The brand kit, the owner's questionnaire answers (`brands.questionnaire`), site facts, and web research on competitors and the local market.

## Returns

A **growth brief**: business goals, the growth lever, priority offers, KPIs, competitor notes, constraints, open questions. Stored as a `brand_research` row of kind `growth_brief`.

Returned as structured output validated by a zod schema, so a workflow can rely on its shape.

## Skills

- `skills/business-diagnosis`
- `skills/growth-levers-by-business-model`
- `skills/offer-and-funnel`
- `skills/kpi-selection`
- `skills/competitor-analysis`

## Tools

- `tools/web-search`
- `tools/read-page`

## Model

`MODELS.expert` (deep reasoning; the judgement here is worth the cost). Set in `config/models.ts`, never in the agent file.

## Runs inside

- `workflows/business-discovery`

## Files when built

- `agent.ts`: the `Agent` (id `growth-consultant`, model, skills, tools). Registered in `mastra/index.ts`.
- `instructions.ts`: who the agent is and what it must return. Short. The craft knowledge lives in the skills.
- `output.schema.ts`: the zod schema of what it returns, unless that shape already exists in `@social-agent/shared`.
