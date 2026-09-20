# Copywriter

**Field:** Platform-native writing.

**Status:** not built yet. This file is the brief for building it.

## Responsible for

- Writes one post for one platform: the hook, caption, hashtags and call to action, in the brand's voice and in the customer segment's language.
- Writes the `ai_note`: why this post, for which segment and which business goal.
- Rewrites from the Editor's notes or the client's rejection reason, fixing the actual complaint.

## Not responsible for

- Reuse one text across platforms. Each platform gets its own post.
- State facts that are not in the brand data (prices, claims, awards, contact details).
- Approve its own work. The Editor does that.

## Reads

The slot (platform, format, pillar, date), brand kit, the target segment, the growth lever and priority offers, recent posts to avoid repetition, and on a rewrite the notes.

## Returns

`hook`, `caption`, `hashtags[]`, `aiNote`.

Returned as structured output validated by a zod schema, so a workflow can rely on its shape.

## Skills

- `skills/hook-writing`
- `skills/caption-frameworks`
- `skills/cta-writing`
- `skills/hashtag-strategy`
- `skills/brand-voice`
- `skills/platform-instagram`
- `skills/platform-linkedin`
- `skills/platform-tiktok`
- `skills/platform-facebook`

## Model

`MODELS.standard` (craft work at volume). Set in `config/models.ts`, never in the agent file.

## Runs inside

- `workflows/content-generation`
- `workflows/post-revision`

## Files when built

- `agent.ts`: the `Agent` (id `copywriter`, model, skills, tools). Registered in `mastra/index.ts`.
- `instructions.ts`: who the agent is and what it must return. Short. The craft knowledge lives in the skills.
- `output.schema.ts`: the zod schema of what it returns, unless that shape already exists in `@social-agent/shared`.
