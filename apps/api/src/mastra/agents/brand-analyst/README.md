# Brand Analyst

**Field:** Understanding a business from its own website.

**Status:** built.

## Responsible for

- Turns the facts our scanner extracted from a website into a brand kit: tagline, summary, audience (first guess), voice, aesthetic, keywords, industry, business name.
- Names the brand colours the scanner found.

## Not responsible for

- Fetch pages or parse HTML: `src/scan` does that in plain code.
- Produce or change phone numbers, emails, addresses, opening hours, colour values or font names. Code extracts those and overwrites whatever the model wrote.
- Judge what the business needs. That is the Growth Consultant.

## Reads

`SiteFacts` (site name candidates, per-page headings and trimmed text, ranked colours, fonts, social links). The prompt deliberately leaves out `facts.business`: phone, email, address and opening hours are code-owned and are never shown to the model.

## Returns

`BrandAnalysis` (`output.schema.ts`): judgement only. It has no field for contact details, colour values or fonts, so the model cannot write them. The `interpret` step assembles the `ScanResult` from this and the extracted facts.

## Skills

- `skills/brand-voice`

Inlined into the instructions with loadSkill(), because a scan is one model call.

## Model

`MODELS.standard` (craft work at volume). Set in `config/models.ts`, never in the agent file.

## Runs inside

- `workflows/brand-scan`

## Notes

Designed in `docs/superpowers/specs/2026-09-20-brand-scan-agent-design.md`. No memory: every scan is independent. Website text is data, never instructions.

## Files when built

- `agent.ts`: the `Agent` (id `brand-analyst`, instructions, inlined skill, model). No tools and no memory, by design. Registered in `mastra/index.ts`.
- `instructions.ts`: who the agent is and what it must return. Short. The craft knowledge lives in the skills.
- `output.schema.ts`: the zod schema of what it returns, unless that shape already exists in `@social-agent/shared`.
- `prompt.ts`: renders `SiteFacts` as the one user message.
