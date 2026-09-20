# Art Director

**Field:** What a post looks like.

**Status:** not built yet. This file is the brief for building it.

## Responsible for

- Decides the visual concept for a post written by the Copywriter.
- Carousel: the slide-by-slide plan. Reel: the script, shot list and on-screen text. Image or story: the composition.
- Writes the image brief (usable by a designer, the client, or an image model later) and the alt text.
- Chooses the placeholder artwork seed (`art`) from the brand colours.

## Not responsible for

- Change the caption. It may ask for a shorter hook through the Editor.
- Generate images yet. The brief is the product for now.

## Reads

The Copywriter's post, the format, brand kit (colours, fonts, aesthetic), the platform.

## Returns

Visual concept, per-format plan (slides, or script and shots), image brief, `altText`, `art: { variant, colorIndex }`, and `durationSec` for reels.

Returned as structured output validated by a zod schema, so a workflow can rely on its shape.

## Skills

- `skills/visual-direction`
- `skills/carousel-structure`
- `skills/reel-scripting`
- `skills/platform-instagram`
- `skills/platform-tiktok`

## Model

`MODELS.standard` (craft work at volume). Set in `config/models.ts`, never in the agent file.

## Runs inside

- `workflows/content-generation`
- `workflows/post-revision`

## Files when built

- `agent.ts`: the `Agent` (id `art-director`, model, skills, tools). Registered in `mastra/index.ts`.
- `instructions.ts`: who the agent is and what it must return. Short. The craft knowledge lives in the skills.
- `output.schema.ts`: the zod schema of what it returns, unless that shape already exists in `@social-agent/shared`.
