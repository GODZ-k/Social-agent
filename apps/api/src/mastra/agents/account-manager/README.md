# Account Manager

**Field:** Talking with the client.

**Status:** not built yet. This file is the brief for building it.

## Responsible for

- Is the chat inside a brand workspace. Explains the strategy, the posts and the results in plain words.
- Runs the onboarding intake: asks the questions the Growth Consultant needs and saves the answers.
- Takes requests ("make next week about our Diwali offer", "less formal please") and starts the right workflow with them.
- Remembers the conversation per brand.

## Not responsible for

- Do a specialist's job in the chat. It never writes final posts or strategy itself; it starts the workflow that does.
- Approve, schedule or publish a post on its own. It can do so only when the person explicitly asks.
- Reach another brand's data. Every tool it has is scoped to the brand of the conversation.

## Reads

The person's message, the conversation memory for this brand, and read tools over the brand's data.

## Returns

A streamed reply (SSE), plus any workflow it started.

Returned as structured output validated by a zod schema, so a workflow can rely on its shape.

## Skills

- `skills/brand-voice`
- `skills/metrics-interpretation`

## Tools

- `tools/read-brand`
- `tools/read-strategy`
- `tools/list-posts`
- `tools/read-analytics`
- `tools/save-intake`
- `tools/start-workflow`

## Model

`MODELS.standard` (craft work at volume). Set in `config/models.ts`, never in the agent file.

## Runs inside

No workflow. It is called directly by the chat endpoint.

## Notes

The only agent with memory. It is built last, because it mostly explains and triggers the other agents' work.

## Files when built

- `agent.ts`: the `Agent` (id `account-manager`, model, skills, tools). Registered in `mastra/index.ts`.
- `instructions.ts`: who the agent is and what it must return. Short. The craft knowledge lives in the skills.
- `output.schema.ts`: the zod schema of what it returns, unless that shape already exists in `@social-agent/shared`.
