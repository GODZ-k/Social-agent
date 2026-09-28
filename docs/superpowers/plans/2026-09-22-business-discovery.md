# Business discovery (2B-1): implementation plan

> **For agentic workers:** Task 1 runs first (everyone depends on its types). Tasks 2, 3, 4 and 5 then run in parallel, each with exclusive file ownership, coding against the interfaces fixed below. Task 6 wires them together, Task 7 verifies. No test suite by decision: "done" is `check-types`, `lint`, `build` clean and the real runs listed in each task.

**Goal:** Before any strategy is written, the API can research a brand in the background and store a versioned growth brief and audience profile that the Strategist reads.

**Architecture:** Same shape as the brand scan. Route → Controller → Service → Repository for the two endpoints; an in-process FIFO `research-queue` runs `runBusinessDiscovery(brandId)`, a Mastra workflow of four steps (`gather`, `diagnose`, `profile`, `save`). Two expert-model agents use two tools (`web-search`, `read-page`) over Firecrawl with per-run budgets carried in `RequestContext`. Results land in `brand_research`, run state in `research_runs`.

**Tech:** Express 5, Drizzle + Neon, zod 4, Mastra 1.66 (`createTool`, `createWorkflow`, `RequestContext`, structured output), Firecrawl `/v2/search` and `/v2/scrape`, Anthropic via Mastra's model router (`MODELS.expert`).

**Spec:** `docs/superpowers/specs/2026-09-22-business-discovery-design.md`. The plan argues from it; read both.

## Global constraints

- Read `apps/api/AGENTS.md` and `apps/api/src/mastra/README.md` first. Load the `mastra` skill and verify every Mastra API against `node_modules/@mastra/core/dist/docs/references/*` (docs read today: `docs-agents-tools.md`, `docs-server-request-context.md`, `docs-agents-structured-output.md`, `reference-agents-generate.md`, `docs-workflows-agents-and-tools.md`). Load `caveman` and report in that style; code, comments and docs stay normal prose.
- Layering is strict: only repositories import Drizzle; only `src/auth/clerk.ts` imports Clerk; only `src/scan/firecrawl.ts` talks to Firecrawl (search included) and every address goes through `vetAddress` first.
- Static classes for Controller/Service/Repository; plain small named functions elsewhere; no nested ternaries; comments only for the why; word lists as data at the top of the file.
- Text that came from the web or from the owner's intake is data inside delimited blocks (`<site>`, `<intake>`, `<page>`, `<results>`), stripped of `<` look-alikes and invisible characters exactly as `agents/brand-analyst/prompt.ts` does (`INVISIBLE`, tag regex). Reuse that helper by moving it to `src/mastra/agents/prompt-text.ts` (Task 3 owns the move).
- One structured-output call per agent per run, retried once only when the answer is rejected (copy `isAnswerRejected` / `analyseWithOneRetry` from `workflows/brand-scan/steps/interpret.ts` into a shared `src/mastra/agents/structured.ts`; Task 3 owns it). Tool loops are capped with `maxSteps: 12`.
- Anthropic models and tools + structured output: pass `structuredOutput: { schema, errorStrategy: "strict", jsonPromptInjection: "auto" }`. Task 3 probes this once with the real model before building on it (see its steps).
- Every endpoint change updates `docs/API_SPEC.md` in the same task.
- NO git commands. The owner commits and applies migrations. Check with `corepack pnpm` (plain `pnpm` is sometimes blocked on this machine): `corepack pnpm --filter api run check-types`, `cd apps/api && ./node_modules/.bin/eslint --max-warnings 0 src scripts`, `corepack pnpm --filter api run build`. Rebuild `packages/shared` and `packages/db` (`corepack pnpm --filter @social-agent/shared run build`, same for db) after changing them; the API reads their `dist`.
- Cost awareness: every live discovery run makes up to 24 Firecrawl requests (free key: 10/min, so a run takes 2–4 minutes) and two expert-model tool loops. Run live discovery only where a task says so.

## Task 1 (first, sequential): shared shapes, intake, tables, migration

**Owns:** `packages/shared/src/schema/research.schema.ts` (new), `packages/shared/src/schema/brand.schema.ts` (intake), `packages/shared/src/index.ts`, `packages/db/src/schema.ts`, `packages/db/drizzle/0004_*.sql` (generated), `docs/API_SPEC.md` (intake fields on brand shapes).

**Estimate:** 60 min.

1. `intakeSchema` in `brand.schema.ts`, exactly the spec's table: `offer` (string, 1–2000, required), `goal` (`z.object({ kind: z.enum(["more_customers","repeat_customers","bigger_orders","launch","awareness"]), note: z.string().max(2000).optional() })`, required), `bestSellers`, `capacity`, `orderValue`, `idealCustomer`, `competitors`, `constraints` (each `z.string().trim().max(2000).optional()`). Export `Intake`. Add `intake: intakeSchema.optional()` to `newBrandSchema` and `brandPatchSchema`; `intake: intakeSchema.nullable()` to `brandSchema`.
2. `research.schema.ts`, exported from `index.ts`:
   ```ts
   export const researchStatusSchema = z.enum(["queued", "running", "done", "failed"]);
   export const researchStepIdSchema = z.enum(["gather", "diagnose", "profile", "save"]);
   export const researchKindSchema = z.enum(["growth_brief", "audience_profile"]);
   export const growthBriefSchema = z.object({
     businessModel: z.object({ sells: z.string(), toWhom: z.string(), howMoneyIsMade: z.string() }),
     bottleneck: z.object({ kind: z.enum(["awareness", "trust", "conversion", "repeat", "orderValue"]), why: z.string() }),
     growthLever: z.string(),
     priorityOffers: z.array(z.object({ name: z.string(), why: z.string() })).max(5),
     kpis: z.array(z.object({ name: z.string(), target: z.string().optional(), why: z.string() })).min(1).max(5),
     competitors: z.array(z.object({ name: z.string(), url: z.string().optional(), note: z.string() })).max(6),
     opening: z.string(),
     constraints: z.array(z.string()),
     openQuestions: z.array(z.string()),
     confidence: z.object({ level: z.enum(["high", "medium", "low"]), why: z.string() }),
   });
   export const audienceSegmentProfileSchema = z.object({
     name: z.string(), summary: z.string(),
     pains: z.array(z.string()), desires: z.array(z.string()), objections: z.array(z.string()),
     language: z.array(z.object({ phrase: z.string(), source: z.string() })),
     platforms: z.array(platformSchema), contentThatLands: z.array(z.string()),
     triggers: z.array(z.string()),
     basis: z.enum(["evidence", "hypothesis"]),
   });
   export const audienceProfileSchema = z.object({
     segments: z.array(audienceSegmentProfileSchema).min(2).max(4),
     followerGap: z.string(),
     competitorAudienceNotes: z.array(z.string()),
   });
   export const researchVersionSchema = <T extends z.ZodTypeAny>(content: T) => z.object({
     version: z.number().int().positive(), content, sources: z.array(z.string()), createdAt: z.string(),
   });
   export const researchSchema = z.object({
     brandId: z.uuid(),
     status: researchStatusSchema.nullable(),      // null: never run
     currentStep: researchStepIdSchema.nullable(),
     error: z.string().nullable(),
     growthBrief: researchVersionSchema(growthBriefSchema).nullable(),
     audienceProfile: researchVersionSchema(audienceProfileSchema).nullable(),
     startedAt: z.string().nullable(), finishedAt: z.string().nullable(),
   });
   ```
   plus the `type` exports (`GrowthBrief`, `AudienceProfile`, `Research`, `ResearchStatus`, `ResearchStepId`, `ResearchKind`).
3. `packages/db/src/schema.ts`: `brands.intake: jsonb("intake").$type<Intake>()` (nullable); enums `researchKind("research_kind", ["growth_brief","audience_profile"])`, `researchStatus("research_status", ["queued","running","done","failed"])`; tables:
   - `brandResearch` ("brand_research"): `id uuid pk`, `brandId uuid notNull → brands`, `kind researchKind notNull`, `version integer notNull`, `content jsonb notNull` (`$type<GrowthBrief | AudienceProfile>()`), `sources jsonb notNull default []` (`$type<string[]>()`), `createdAt`; `uniqueIndex("brand_research_brand_kind_version_idx").on(brandId, kind, version)`.
   - `researchRuns` ("research_runs"): `id uuid pk`, `brandId uuid notNull → brands`, `requestedBy uuid notNull → users`, `status researchStatus notNull default "queued"`, `currentStep text`, `error text`, `startedAt`, `finishedAt`, `createdAt`; `index("research_runs_brand_id_idx").on(brandId)`.
   - Row types: `BrandResearchRow`, `NewBrandResearchRow`, `ResearchRunRow`, `NewResearchRunRow`.
4. `corepack pnpm --filter @social-agent/db run db:generate` → review the SQL (two enums, two tables, `brands.intake` column, one unique index), rename nothing. Do **not** run `db:migrate`; the owner applies it.
5. Build both packages, `check-types` for api still clean (nothing uses the new types yet). `docs/API_SPEC.md`: `intake` on `NewBrand`, `BrandPatch`, `Brand`.

**Produces:** the types above; `brands.intake`; `brand_research`, `research_runs`.

## Interfaces every later task codes against

```ts
// src/scan/firecrawl.ts — Task 2
export type SearchHit = { url: string; title: string; description: string };
export async function searchWeb(query: string, options: { limit: number; deadline: number }): Promise<SearchHit[]>;
// existing: fetchPage(rawUrl, { deadline }) → FetchedPage (mainText via existing extractors)

// src/mastra/tools/research-budget.ts — Task 2
export type ResearchBudget = { searchesLeft: number; readsLeft: number; deadline: number; sources: Set<string> };
export function newResearchBudget(): ResearchBudget;   // 8 searches, 12 reads, 6 minutes
export type ResearchContext = { budget: ResearchBudget };
// The workflow creates `new RequestContext<ResearchContext>()`, sets "budget", and passes it to every agent.generate.
// Tools read it with `requestContext.get("budget")`. Every URL a tool actually read is added to `budget.sources`.

// src/mastra/tools/web-search.ts, read-page.ts — Task 2
export const webSearch: Tool  // id "web-search", input { query: string }, output { results: SearchHit[], note?: string }
export const readPage: Tool   // id "read-page", input { url: string }, output { url, title, text (≤ 6000 chars), note?: string }

// src/mastra/agents/prompt-text.ts, structured.ts — Task 3
export function asDataBlock(tag: "site" | "intake" | "page" | "results" | "brief", text: string): string;
export function generateStructured<T>(agent, prompt, schema: z.ZodType<T>, opts: { requestContext, maxSteps, onRejected }): Promise<T>;

// src/mastra/agents/growth-consultant/agent.ts, audience-researcher/agent.ts — Task 3
export const growthConsultant: Agent;   // id "growth-consultant", tools { webSearch, readPage }
export const audienceResearcher: Agent; // id "audience-researcher", tools { webSearch, readPage }
export function renderDiscoveryInput(input: GatheredInput): string;              // growth-consultant/prompt.ts
export function renderProfileInput(input: GatheredInput, brief: GrowthBrief): string; // audience-researcher/prompt.ts

// src/mastra/workflows/business-discovery/run.ts — Task 4
export type GatheredInput = { brand: Pick<Brand, "name"|"url"|"industry"|"brand"|"business"|"platforms">; intake: Intake; siteFacts: SiteFacts | null; previous: { brief: GrowthBrief | null; profile: AudienceProfile | null } };
export type DiscoveryOutcome = { ok: true; brief: GrowthBrief; profile: AudienceProfile; sources: string[] } | { ok: false; code: "INTAKE_REQUIRED" | "RESEARCH_FAILED"; message: string };
export async function runBusinessDiscovery(brandId: string, options?: { onStep?: (step: ResearchStepId) => void | Promise<void> }): Promise<DiscoveryOutcome>;
```

## Task 2: Firecrawl search, budget, the two tools

**Owns:** `src/scan/firecrawl.ts` (add `searchWeb` and a `readMainText(url, deadline)` helper that returns title + main text from an existing `fetchPage`), `src/mastra/tools/research-budget.ts`, `src/mastra/tools/web-search.ts`, `src/mastra/tools/read-page.ts`, `src/mastra/tools/README.md` (status), `apps/api/scripts/research-tools.ts` (a terminal probe), `.agents/skills/brand-scan-firecrawl/SKILL.md` (append the verified search facts).

**Estimate:** 90 min.

1. Probe `/v2/search` with curl first (key from `apps/api/.env`, never printed): `POST https://api.firecrawl.dev/v2/search` body `{ "query": "four barrel coffee reviews", "limit": 3 }`. Record the exact response shape (v2 groups results, expect `data.web[]` with `url`, `title`, `description`) and the error shape for a bad body. Write what you found into the `brand-scan-firecrawl` skill under a new "Search" heading.
2. `searchWeb`: same headers/timeout/`classifyResponse` path as scrape, `limit` clamped 1–5, returns `SearchHit[]` with `URL.canParse` filtering. No address vetting on results here: vetting happens when a page is read.
3. `readMainText(rawUrl, deadline)`: `fetchPage` + the existing main-text extraction used by the scan (`extract-facts.ts` exposes it; import, do not duplicate), trimmed to 6,000 characters on a word boundary.
4. `research-budget.ts` as in the interfaces. `web-search` tool: when `budget.searchesLeft === 0` returns `{ results: [], note: "Search budget spent. Conclude from what you have." }`; else decrements and searches. `read-page` tool: when `readsLeft === 0` the same kind of note; a `ScanError`/blocked address returns `{ url, title: "", text: "", note: "Could not read this page." }`, never throws into the model; adds the URL to `budget.sources` on success. Both tools read `requestContext.get("budget")`; if absent (a stray Studio call) they answer with the note "No research budget in this request" and do nothing.
5. `scripts/research-tools.ts`: `corepack pnpm --filter api exec tsx scripts/research-tools.ts search "<query>"` and `... read <url>` run the tools directly with a fresh budget and print the output. Add `research-tools` to `package.json` scripts.
6. Real runs to record: search "four barrel coffee reviews" (3 hits, real URLs), read `https://fourbarrelcoffee.com` (title + text ≤ 6000), read `http://10.0.0.1/` → "Could not read this page.", 9 searches in a row → the 9th answers "budget spent".

## Task 3: the two agents

**Owns:** `src/mastra/agents/prompt-text.ts` (new; move `INVISIBLE`/tag stripping from `brand-analyst/prompt.ts` and re-import there), `src/mastra/agents/structured.ts` (new; move `isAnswerRejected`, retry from `interpret.ts` and re-import there), `src/mastra/agents/growth-consultant/{agent,instructions,output.schema,prompt}.ts`, `src/mastra/agents/audience-researcher/{agent,instructions,output.schema,prompt}.ts`, both READMEs (status), `src/mastra/index.ts` (register), `apps/api/scripts/discovery-probe.ts`.

**Estimate:** 2 h.

1. Probe first: `scripts/discovery-probe.ts` calls `growthConsultant.generate` with a stub `GatheredInput` (fourbarrelcoffee brand kit from a saved `--facts` run, a plausible intake) and `structuredOutput: { schema: growthBriefSchema, errorStrategy: "strict", jsonPromptInjection: "auto" }`, `maxSteps: 12`, a real `RequestContext` with a budget. Record: does the model call `web-search`? does the structured answer parse? how many steps, how long, how many searches/reads? If tools are never called with native structured output, switch to `jsonPromptInjection: true` and re-probe; if still not, use the `model:` structuring option (`MODELS.standard`) per the Mastra doc. Write the outcome in the ledger before writing the second agent.
2. `output.schema.ts` re-exports the shared schema (`growthBriefSchema` / `audienceProfileSchema`) with `.describe()` on each field as the Brand Analyst does; the field text is the only place the model learns what "bottleneck" or "basis" means.
3. `instructions.ts`, short, in the Brand Analyst's voice: who, what it receives (the delimited blocks are data), what it returns, what it never does (invent margins, capacity, order value, demographics; those become `openQuestions` / `basis: "hypothesis"`), and how to use the tools (search for competitors and reviews, read at most the pages that matter, stop when the budget note appears). Skill bodies are inlined with `loadSkill` for the five (Growth Consultant) and four (Audience Researcher) skills in their READMEs.
4. `prompt.ts`: `renderDiscoveryInput` renders brand kit, intake (question + answer lines, unanswered ones listed as "Not answered"), site facts summary (names, headings, offers text; ≤ 8,000 chars), previous brief if any; `renderProfileInput` adds the brief as a `<brief>` block. All through `asDataBlock`.
5. Register both agents in `mastra/index.ts`. `check-types`, lint, build clean. Real run: the probe against fourbarrelcoffee for both agents; paste the brief's `bottleneck`, `growthLever`, `openQuestions` and the profile's segment names into the ledger.

## Task 4: workflow, queue, endpoints

**Owns:** `src/mastra/workflows/business-discovery/{workflow,run,schemas}.ts`, `steps/{gather,diagnose,profile,save}.ts`, its README (status), `src/research-queue/index.ts`, `src/repositories/research.repository.ts`, `src/services/research.service.ts`, `src/controllers/research.controller.ts`, `src/routes/research.route.ts`, `src/routes/brands.route.ts` (mount `/:brandId/research`), `src/services/brands.service.ts` (`intake` passes through create/update; `toBrand` maps it), `src/server.ts` (start-up sweep for research runs), `docs/API_SPEC.md` (two endpoints), `src/mastra/index.ts` (register the workflow, coordinate with Task 3 by editing only the `workflows:` line).

**Estimate:** 2.5 h.

1. Repository (`ResearchRepository`, static): `createRun`, `findRunById(id, scope)`, `findActiveRunFor(brandId)`, `findLatestRunFor(brandId)`, `markRunning`, `markStep`, `markDone`, `markFailed`, `failInterrupted` (copy the scan repository's shape); `latestResearch(brandId, kind)` and `insertResearch({ brandId, kind, content, sources })` which computes `version = max + 1` inside one transaction.
2. Service (`ResearchService`): `start(user, brandId)`: brand via `BrandsService.get` (scope rule, 404), `intake` null → `AppError("Answer the intake questions before research can start.", 409, "INTAKE_REQUIRED")`, active run → return it with `created: false` (`409 RESEARCH_RUNNING` per spec; the controller sends 409 with the run in `data`), else create, `enqueueResearch(id)`, `created: true`. `get(user, brandId)`: latest run + latest versions → `Research` shape. Status `null` when no run ever.
3. Controller/route: `POST /` → 202 or 409, `GET /` → 200; `validateMiddleware` not needed (no body). Mounted in `brands.route.ts` as `router.use("/:brandId/research", researchRoute)` with `mergeParams: true`.
4. Queue: copy `scan-queue` with `RESEARCH_CONCURRENCY = 1`; `runResearch(id)` claims, calls `runBusinessDiscovery(run.brandId, { onStep })`, stores `ok` results through `insertResearch` twice and `markDone`, failures through `markFailed(outcome.message)`. `server.ts`: sweep `ResearchRepository.failInterrupted()` next to the scan sweep; shutdown counts pending research too.
5. Workflow: `gather` (code: `BrandsRepository.findById` is off-limits to a workflow, so `run.ts` gathers through `BrandsService`/`ResearchRepository` **before** starting the workflow and passes `GatheredInput` as `inputData`; the `gather` step only validates and shapes it, so the step id still exists for the UI), `diagnose` (Growth Consultant via `generateStructured`, fails to `{ failure: { code: "RESEARCH_FAILED" } }` on a second rejected answer), `profile` (Audience Researcher, reads the brief), `save` (returns `{ ok: true, brief, profile, sources }`; the queue writes rows, so the workflow stays free of Drizzle). `run.ts` mirrors `brand-scan/run.ts`: streams step starts to `onStep`, throws on non-success status, parses the outcome. Site facts: from the brand's linked scan (`brand_scans.result` + `pages`), else `null` (do not re-scan in this phase; the brief's `confidence` says so).
6. `docs/API_SPEC.md`: the two endpoints, the `Research` shape, the two 409 codes.
7. Real runs, with the owner's migration applied: `POST /brands` with intake (curl with a dev token) → `POST …/research` → 202; second POST → 409 `RESEARCH_RUNNING`; `GET` polls to `done` on fourbarrelcoffee; a brand without intake → 409 `INTAKE_REQUIRED`; kill the API mid-run and restart → run `failed` with the interruption message.

## Task 5: the nine skills, written for real

**Owns:** `src/mastra/skills/{business-diagnosis,growth-levers-by-business-model,offer-and-funnel,kpi-selection,competitor-analysis,customer-personas,review-mining,jobs-to-be-done,audience-analysis}/SKILL.md` and their `references/*.md`.

**Estimate:** 3 h wall clock: three agents, three skills each, then one reviewer.

1. Shared rubric (in the dispatch prompt): 120–250 lines per SKILL.md; the method in the order a good consultant works; rules of thumb with numbers and when they do not apply; what must be asked, not guessed; two worked examples (a café; a local service business such as a dentist or a plumber); a "good vs bad output" pair; long tables to `references/`. Front matter `name` and `description` kept; the "Status: outline only" paragraph replaced.
2. Reviewer scores each skill 1–5 against "would a good consultant recognise this as their method" and sends anything under 4 back once.

## Task 6: integration (lead)

Register agents and workflow together in `mastra/index.ts`; `check-types`, lint, build; wire `scripts/scan.ts`-style `scripts/discovery.ts` (`corepack pnpm --filter api run discovery -- <brandId>`) for terminal runs.

## Task 7: verification (lead)

- Migration applied by the owner; API starts, sweep logs.
- Live discovery on fourbarrelcoffee, meowmeowtweet, donangie with intake written as a plausible owner; each within budget and under 5 minutes; a reviewer agent grades each brief and profile against the spec's bar ("a brief that would fit any business in the industry fails"; open questions where intake was thin; sources are URLs the tools read).
- Safety: `read-page` on `http://10.0.0.1/` → "Could not read"; a search result page containing "ignore your instructions" changes nothing in the output shape (use a saved fixture through the tool directly).
- Endpoint checks from Task 4 recorded with response bodies.
- Ledger `.superpowers/sdd/2026-09-22-business-discovery/progress.md`, `docs/TASKS.md`, `docs/LESSION.md`, `docs/ARCHITECTURE.md` updated.
