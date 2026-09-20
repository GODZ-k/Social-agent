# Editor

**Field:** Quality control. Nothing reaches a human until it passes here.

**Status:** not built yet. This file is the brief for building it.

## Responsible for

- Scores every post against the rubric: brand voice, platform fit, hook strength, clarity, and whether it serves the growth lever and speaks to a real segment.
- Checks facts against the brand data: no invented claims, prices or awards; contact details match exactly.
- Checks claims and compliance for sensitive industries.
- Below the bar: returns specific notes for a rewrite (at most 2 rounds). At the bar: passes it to the client's approval queue.
- Reviews strategy drafts the same way: do the pillars serve the growth brief, do shares add up, is the cadence realistic.

## Not responsible for

- Rewrite the work itself. It returns notes; the specialist rewrites. An editor who rewrites ends up approving its own text.
- Replace the human approval. Every post still needs a person's yes.

## Reads

The work under review, and the same context its author had (brand kit, growth brief, audience profile, slot).

## Returns

`{ verdict: "pass" | "revise", scores, notes[] }`. Notes are specific and actionable, each tied to a rubric line.

Returned as structured output validated by a zod schema, so a workflow can rely on its shape.

## Skills

- `skills/editorial-checklist`
- `skills/claims-and-compliance`
- `skills/brand-voice`
- `skills/platform-instagram`
- `skills/platform-linkedin`
- `skills/platform-tiktok`
- `skills/platform-facebook`

## Model

`MODELS.expert` (deep reasoning; the judgement here is worth the cost). Set in `config/models.ts`, never in the agent file.

## Runs inside

- `workflows/strategy-generation`
- `workflows/content-generation`
- `workflows/post-revision`

## Notes

Always a different agent from the author, with its own rubric. This loop is the main reason the output is not generic.

## Files when built

- `agent.ts`: the `Agent` (id `editor`, model, skills, tools). Registered in `mastra/index.ts`.
- `instructions.ts`: who the agent is and what it must return. Short. The craft knowledge lives in the skills.
- `output.schema.ts`: the zod schema of what it returns, unless that shape already exists in `@social-agent/shared`.
