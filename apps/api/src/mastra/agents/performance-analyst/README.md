# Performance Analyst

**Field:** Reading results.

**Status:** not built yet. This file is the brief for building it.

## Responsible for

- Reads post metrics over time, account metrics and audience insights, against the KPIs in the growth brief.
- Writes learnings: an insight, the evidence behind it, and its impact (up, down, neutral).
- Is honest about sample size. Three posts are an observation, not a finding.
- Recommends what the next strategy version should change, and whether the evidence is strong enough to write one now.

## Not responsible for

- Fetch metrics from the networks. A background job does that.
- Rewrite the strategy. It hands recommendations to the Strategist.

## Reads

`post_metrics` curves, `account_metrics`, `audience_insights`, the posts with their pillar, format, platform and time, the active strategy, the growth brief's KPIs.

## Returns

`learnings[]` (`insight`, `evidence`, `impact`) and `{ newStrategyRecommended: boolean, reasons[] }`.

Returned as structured output validated by a zod schema, so a workflow can rely on its shape.

## Skills

- `skills/metrics-interpretation`
- `skills/kpi-selection`
- `skills/posting-cadence`

## Model

`MODELS.expert` (deep reasoning; the judgement here is worth the cost). Set in `config/models.ts`, never in the agent file.

## Runs inside

- `workflows/learning-cycle`

## Files when built

- `agent.ts`: the `Agent` (id `performance-analyst`, model, skills, tools). Registered in `mastra/index.ts`.
- `instructions.ts`: who the agent is and what it must return. Short. The craft knowledge lives in the skills.
- `output.schema.ts`: the zod schema of what it returns, unless that shape already exists in `@social-agent/shared`.
