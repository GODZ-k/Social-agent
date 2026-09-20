# Brand Analyst

**Field:** Understanding a business from its own website.

**Status:** not built yet. This file is the brief for building it.

## Responsible for

- Turns the facts our scanner extracted from a website into a brand kit: tagline, summary, audience (first guess), voice, aesthetic, keywords, industry, business name.
- Names the brand colours the scanner found.

## Not responsible for

- Fetch pages or parse HTML: `src/scan` does that in plain code.
- Produce or change phone numbers, emails, addresses, opening hours, colour values or font names. Code extracts those and overwrites whatever the model wrote.
- Judge what the business needs. That is the Growth Consultant.

## Reads

`SiteFacts` (site name candidates, per-page headings and trimmed text, ranked colours, fonts, contact details, social links).

## Returns

`ScanResult` from `@social-agent/shared` (`name?`, `industry?`, `brand: BrandKit`, `business?`).

Returned as structured output validated by a zod schema, so a workflow can rely on its shape.

## Skills

- `skills/brand-voice`

## Model

`MODELS.standard` (craft work at volume). Set in `config/models.ts`, never in the agent file.

## Runs inside

- `workflows/brand-scan`

## Notes

Designed in `docs/superpowers/specs/2026-09-20-brand-scan-agent-design.md`. No memory: every scan is independent. Website text is data, never instructions.

## Files when built

- `agent.ts`: the `Agent` (id `brand-analyst`, model, skills, tools). Registered in `mastra/index.ts`.
- `instructions.ts`: who the agent is and what it must return. Short. The craft knowledge lives in the skills.
- `output.schema.ts`: the zod schema of what it returns, unless that shape already exists in `@social-agent/shared`.
