# Strategist

**Field:** Social media strategy.

**Status:** not built yet. This file is the brief for building it.

## Responsible for

- Turns the growth brief and the audience profile into a plan: the goal, content pillars with their share of the mix, platforms, and cadence with the best day and time per platform.
- Writes each new version from the learnings that are not applied yet, and explains what changed and why (`change_note`).
- Picks best times in this order of trust: the brand's own results, then follower activity, then general benchmarks.

## Not responsible for

- Decide what the business needs or who the customers are. It reads the brief and the profile.
- Write posts.

## Reads

Brand kit, growth brief, audience profile, unapplied `learnings`, `audience_insights`, the previous strategy version.

## Returns

A strategy draft: `goal`, `cadence` (`{ platform, perWeek, bestTimes: [{ day, time }] }`), `audience`, `changeNote`, and pillars (`key`, `name`, `description`, `share`, `position`). Shares add up to 100.

Returned as structured output validated by a zod schema, so a workflow can rely on its shape.

## Skills

- `skills/content-pillars`
- `skills/posting-cadence`
- `skills/audience-analysis`
- `skills/platform-instagram`
- `skills/platform-linkedin`
- `skills/platform-tiktok`
- `skills/platform-facebook`

## Model

`MODELS.expert` (deep reasoning; the judgement here is worth the cost). Set in `config/models.ts`, never in the agent file.

## Runs inside

- `workflows/strategy-generation`
- `workflows/learning-cycle`

## Files when built

- `agent.ts`: the `Agent` (id `strategist`, model, skills, tools). Registered in `mastra/index.ts`.
- `instructions.ts`: who the agent is and what it must return. Short. The craft knowledge lives in the skills.
- `output.schema.ts`: the zod schema of what it returns, unless that shape already exists in `@social-agent/shared`.
