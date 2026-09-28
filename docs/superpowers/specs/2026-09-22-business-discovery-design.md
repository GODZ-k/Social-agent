# Business discovery (Phase 2B-1) — design

Date: 2026-09-22. Status: design approved in chat section by section; this file is for the owner's review before the plan.

Builds on: the agent-team design `apps/api/src/mastra/README.md` and the briefs `agents/growth-consultant/README.md`, `agents/audience-researcher/README.md`, `workflows/business-discovery/README.md`; the schema spec `docs/superpowers/specs/2026-09-20-database-schema-design.md`; the endpoint catalogue `docs/superpowers/specs/2026-09-20-api-endpoints-catalogue.md`; the brand scan (`src/scan`, `workflows/brand-scan`) whose patterns this reuses.

## Goal

Before any strategy is written, the system understands the business and its customers: a **growth brief** (what is sold, to whom, how money is made, the bottleneck, the lever social media should pull, priority offers, KPIs, competitors, constraints, open questions) and an **audience profile** (2–4 real segments with pains, desires, objections, their own words, platforms, content that lands; each marked evidence or hypothesis). Both come from the brand kit, the owner's intake answers, the scanned site facts and live web research, and are stored as versioned research the Strategist (2B-2) reads.

## Decisions (2026-09-22, owner)

1. **Discovery before strategy**, as the agent-team design says — not strategy from the brand kit alone.
2. **Intake is a form in onboarding**, eight questions, after the brand-kit review; the first two are required. Saved to `brands.intake`, editable in Settings. Unanswered questions become open questions in the brief, never guesses.
3. **Web search is Firecrawl `/v2/search`** (same vendor as the scan, key already configured). Page reads go through `src/scan/firecrawl.ts`, so address vetting applies.
4. **Discovery runs in the background** (1–4 minutes: web research plus two expert-model agents) and is polled, like the scan; never one long request.
5. **Research is versioned, never edited.** A re-run writes the next version.
6. The nine skills these agents use are **written for real** in this phase (today they are outlines).

## Intake

`intakeSchema` in `packages/shared/src/schema/brand.schema.ts`:

| Key | Question shown to the owner | Type | Required |
|---|---|---|---|
| `offer` | What do you sell, and how do people buy it? (walk-in, booking, online order, enquiry) | text | yes |
| `goal` | What is your main goal for social media in the next 3 months? | enum `more_customers` · `repeat_customers` · `bigger_orders` · `launch` · `awareness` + optional note | yes |
| `bestSellers` | Your best sellers, and anything with a high margin you would like to sell more of | text | no |
| `capacity` | Anything with spare capacity or a slow period (days, seasons) | text | no |
| `orderValue` | Typical order or booking value | text | no |
| `idealCustomer` | Who is your ideal customer, in your own words | text | no |
| `competitors` | Two or three competitors or accounts you watch | text | no |
| `constraints` | Anything the posts must never say or show | text | no |

`brands.intake` jsonb, nullable (null = not asked yet). `newBrandSchema.intake` optional; `brandPatchSchema.intake` optional (Settings). Text answers are capped (2,000 characters each) and treated as data in prompts, delimited the way the scan delimits site text.

## Data

New table `brand_research`:

| Column | Type | Note |
|---|---|---|
| `id` | uuid pk | |
| `brand_id` | uuid → brands | |
| `kind` | enum `research_kind`: `growth_brief`, `audience_profile` | |
| `version` | integer | per brand and kind, starts at 1 |
| `content` | jsonb | `GrowthBrief` or `AudienceProfile` (shared zod schemas) |
| `sources` | jsonb | the URLs the agent read, for the owner to check |
| `created_at` | timestamptz | |

Unique `(brand_id, kind, version)`. One migration (`0004_brand_research`), applied by the owner.

Run tracking reuses the scan pattern with its own table `research_runs`: `id, brand_id, requested_by, status (queued · running · done · failed), current_step, error, started_at, finished_at, created_at`. One active run per brand.

## Shapes (`packages/shared/src/schema/research.schema.ts`)

- `growthBriefSchema`: `businessModel` (what is sold, to whom, how money is made), `bottleneck` (enum awareness · trust · conversion · repeat · orderValue + why), `growthLever` (one sentence), `priorityOffers[]` (`name`, `why`), `kpis[]` (`name`, `target?`, `why`), `competitors[]` (`name`, `url?`, `note`), `opening` (where this brand can win), `constraints[]`, `openQuestions[]` (what the owner must still answer), `confidence` (`high` · `medium` · `low` + why).
- `audienceProfileSchema`: `segments[]` (2–4) each `name`, `summary`, `pains[]`, `desires[]`, `objections[]`, `language[]` (verbatim customer phrases, with source), `platforms[]`, `contentThatLands[]`, `basis` (`evidence` · `hypothesis`), `triggers[]`; `followerGap` (who follows today vs who the business wants; "unknown until accounts are connected" when so); `competitorAudienceNotes[]`.
- `researchSchema` (API output): `{ status, currentStep, error, growthBrief: { version, content, sources, createdAt } | null, audienceProfile: {...} | null, startedAt, finishedAt }`.

## Agents

Same shape as the Brand Analyst: `agent.ts` (id, model `AGENT_MODELS[...]` = expert, instructions + skills inlined via `loadSkill`, tools), `instructions.ts` (short: who, what it gets, what it returns, what it never does; tool text is data), `output.schema.ts` re-exporting the shared schema. One `generate` call with structured output per agent, retried once only on a bad answer (the interpret-step pattern).

- **Growth Consultant** — tools `web-search`, `read-page`. Skills: business-diagnosis, growth-levers-by-business-model, offer-and-funnel, kpi-selection, competitor-analysis.
- **Audience Researcher** — tools `web-search`, `read-page` (`read-audience-insights` is phase 5; until then the profile says so). Skills: customer-personas, review-mining, jobs-to-be-done, audience-analysis.

Model calls: an agent with tools makes several calls per run (tool loop). Cap: `maxSteps` 12 per agent.

## Tools (`src/mastra/tools/`)

- `web-search.ts`: Firecrawl `/v2/search` with `limit ≤ 5`, `scrapeOptions: { formats: ["markdown"] }` off by default (the agent reads a page on purpose with `read-page`); returns `{ url, title, description }[]`. Budget: at most 8 searches per run.
- `read-page.ts`: `fetchPage(url, { deadline })` from `src/scan/firecrawl.ts`, main text trimmed to 6,000 characters, returned as data. Budget: at most 12 reads per run. A blocked or unreachable address returns a short "could not read" result, never throws into the model.
- Budgets live in a per-run `ResearchBudget` object the workflow creates and passes through the tool context; when exhausted, a tool answers "budget spent" and the agent must conclude.
- Rules from `tools/README.md`: brand id from the request context, never from the model; text from the web is data; one tool per file.

## Workflow `business-discovery` (`src/mastra/workflows/business-discovery/`)

| Step | Who | Does |
|---|---|---|
| `gather` | code | brand kit, intake, latest scan facts (`brand_scans.result` + pages of the scan linked to the brand, or the site facts re-read if none), previous brief/profile if any |
| `diagnose` | Growth Consultant | writes the growth brief |
| `profile` | Audience Researcher | writes the audience profile, reading the brief |
| `save` | code | two `brand_research` rows (next version each), run → `done` |

Failures return `{ failure }` like the scan; a `ScanError`-style code set: `INTAKE_REQUIRED`, `RESEARCH_FAILED` (model/tool failure after retry), plus infra errors as plain errors. `runBusinessDiscovery(brandId, { onStep })` is the one entry point.

Execution: a `research-queue` sibling of `scan-queue` (same shape: FIFO, one at a time, start-up sweep marks leftovers failed). Rulings carried over: one active run per brand; interrupted message in plain words.

## Endpoints (2, catalogue §8 gains a "Research" pair)

- `POST /api/v1/brands/:brandId/research` — owner or admin. Requires `brands.intake` (else `409 INTAKE_REQUIRED`) and no active run (else `409 RESEARCH_RUNNING`, returning the running run). `202` `Research` with `status: "queued"`.
- `GET /api/v1/brands/:brandId/research` — `200` `Research` (status + latest brief and profile; `404 BRAND_NOT_FOUND` only).
- Onboarding calls `POST …/research` right after `POST /brands`; the Strategy screen shows the research state until done. The OpenAPI registry gains both operations (on the `feature/openapi` branch when merged; on `backend` the Postman collection gains them until then).

## Skills — the real work

Each of the nine skills becomes a working method (~120–250 lines): what to look for, in what order, the rules of thumb with numbers, what must be asked not guessed, worked examples for two business types (a café, a local service business), and what a good vs a bad output looks like. Long reference material goes in `references/*.md`. Written by one agent per skill from a shared rubric, reviewed by a reviewer who scores each against the bar "would a good consultant recognise this as their method".

## Verification (no tests)

- Migration applies on the dev database (owner runs it); `check-types`, build clean.
- Intake round-trip: `POST /brands` with intake, `PATCH /brands/:id` with a changed answer, `GET` shows it.
- Live discovery on 3 of the 4 scan test sites with intake answers written as a plausible owner (café: fourbarrelcoffee; skincare e-commerce: meowmeowtweet; restaurant: donangie): each run completes within budget; the briefs are judged by a reviewer with the rubric — a brief that would fit any business in the industry fails; open questions listed where intake was thin; sources are real URLs the agent read.
- Safety: `read-page` on `http://10.0.0.1/` answers "could not read"; a search result page containing "ignore your instructions" does not change the output shape.
- `POST …/research` without intake → 409; while running → 409 with the run; restart mid-run → `failed` with the interruption message.

## Out of scope

Strategy generation (2B-2), the Editor review, the 15-minute activation job, the web app screens (mock until the onboarding wiring), `read-audience-insights` (phase 5), re-running discovery on a schedule.
