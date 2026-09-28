# Scan Clean-Up Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** `apps/api/src/scan/*` and the brand-scan Mastra files read as small, plainly named functions with only the comments that explain a *why* — with behaviour byte-identical to today.

**Architecture:** No structural change. Plain functions stay plain functions (owner's choice 2026-09-22: no class-based restructuring). Long functions are split along the seams named below; regex walls become named tables; nested ternaries become guard clauses or small helpers; comments that restate the code are deleted, comments that carry a reason are kept and shortened.

**Spec:** the owner's words — "follow clean code approach", "make comments more readable, remove unnecessary comments" — plus the clean-code hotspot list in the 2026-09-22 final review (reproduced in each task).

## Global Constraints

- **Behaviour is frozen.** Every exported name and signature stays. The baseline script `apps/api/scripts/_refactor-baseline.ts` run against the fixture directory must print output byte-identical to `before.json` (paths given in the task). `pnpm --filter api run check-types` clean. No new dependencies.
- **No git commits, no `git add`.** The owner commits.
- `src/scan/*` never imports `@mastra/*` or `src/mastra`. Only `src/scan/firecrawl.ts` sends a user-typed address anywhere.
- **Function rules:** one level of abstraction per function; a function fits on one screen (≤ ~30 lines); no nested ternaries; a boolean expression longer than one line gets a name; a regex used for a rule gets a name that says what it matches; lists of words/hosts/classes are data at the top of the file.
- **Comment rules:** delete a comment that says what the next line already says; keep a comment only if it answers "why" (a rule from the spec, a real-site surprise, a trap); at most 2 lines per comment; file header at most 3 lines saying what the file owns; no "this function does X" doc comments on functions whose name already says X; no commented-out code; no TODO without an owner.
- Firecrawl is rate-limited today (keyless cap hit): do **not** run `scan --facts`/`--fetch`/full scans. The fixture baseline is the verification. The owner reruns the four sites live once `FIRECRAWL_API_KEY` is set.
- Run scripts as `pnpm --filter api run <script>` from the repo root; keep commands short; write the report incrementally.

## Fixtures and baseline

- Fixture directory: `C:\Users\Rnf-user.DESKTOP-H20A3J8\AppData\Local\Temp\claude\C--Users-Rnf-user-DESKTOP-H20A3J8-Desktop-social-agent\9dc6a293-0e1a-4279-823e-f30d350e2230\scratchpad\baseline` (7 HTML pages + 4 Firecrawl branding JSONs + `before.json`).
- Check: `pnpm --filter api exec tsx scripts/_refactor-baseline.ts "<fixture dir>" > "<fixture dir>/after-<task>.json"` then `diff "<fixture dir>/before.json" "<fixture dir>/after-<task>.json"` → must print nothing. (Git Bash `diff`, or PowerShell `Compare-Object (Get-Content before.json) (Get-Content after.json)` → no output.)

## File ownership

Tasks A and B run in parallel and never touch each other's files. If `check-types` or the baseline fails inside a file you do not own, wait 60 s and rerun — the other agent is mid-edit.

---

### Task A: `src/scan/extract-facts.ts`

**Files:** Modify `apps/api/src/scan/extract-facts.ts` only.

**Hotspots (from the review):**
- `extractPageFacts` (~50 lines, eleven jobs): split into `pageIdentity($)` (title/description/og), `contactDetails($, nodes)` (phones/emails via the existing `hrefsWithScheme`/`decodeAll`), `socialLinksOn($, url)`, `logoOn($, nodes, url)`, and keep `extractPageFacts` as a ≤ 20-line assembler that calls them in order and ends with `mainText`.
- `mainText` (~192-210) mixes removal of noise with extraction and has a nested ternary (~206): extract `contentRoot($)` that returns the element to read from, and `removeNoise($)`; the order dependence ("last: this removes elements") becomes explicit in the assembler.
- `businessNodes` (~105-137) with the nested ternary at ~120-124 and a 12-line doc comment: extract `sameEntityProperties(node)` returning the property names to descend through; replace the comment by the function name + a 2-line why.
- Nested ternary at ~143-147 and ~229: guard clauses or a named helper.
- The five module regexes (~14, 19, 32) and `NOT_A_BUSINESS`: `NOT_A_BUSINESS` becomes a `Set`; each regex gets a name that says what it matches and, where it is a word list, becomes an array joined into the regex.
- Comments: apply the comment rules; the file currently explains itself at length — most of that goes.

- [ ] Step 1: read the file once, list the functions you will create with their one-line responsibility in the report before editing.
- [ ] Step 2: refactor; after each function, `pnpm --filter api run check-types`.
- [ ] Step 3: run the baseline check; diff must be empty. If it is not, the refactor changed behaviour: fix the refactor, never the baseline.
- [ ] Step 4: report — new function list with line counts, before/after line count of the file, the empty diff, comments removed (count) and kept (list, one line each with the why they carry).

### Task B: everything else

**Files:** Modify `apps/api/src/scan/firecrawl.ts`, `index.ts`, `discover-pages.ts`, `extract-style.ts`, `normalise-url.ts`, `types.ts`, `address-check.ts`; `apps/api/src/mastra/workflows/brand-scan/{run,schemas,workflow}.ts`, `steps/*.ts`; `apps/api/src/mastra/agents/brand-analyst/{agent,instructions,prompt,output.schema}.ts`; `apps/api/src/mastra/config/skills.ts`; `apps/api/scripts/scan.ts`. NOT `extract-facts.ts`.

**Hotspots (from the review):**
- `firecrawl.ts` `callFirecrawl` mixes transport, JSON parsing and three error taxonomies with a ~140-char boolean: extract `classifyResponse(status, body, text)` that returns a `ScanError`/`Error`/the body; name the boolean (`isAccountOrOutage(status)`). Keep the exact ordering: NOT_A_WEBSITE code → account/outage → SITE_UNREACHABLE. The header comment says what the file owns and the one non-obvious fact (Firecrawl does not refuse private addresses) in ≤ 3 lines; move the keyless note to `.env.example` if it is not already there.
- `index.ts` `businessInfo`: four conditional spreads + `Object.keys().length` sentinel → build the object, then `hasAnyDetail(info)`.
- `prompt.ts` ~16 nested ternary → guard clause; comments there are security-relevant, keep the why in ≤ 2 lines each.
- `interpret.ts`: comments were rewritten today; shorten to the rules (the `isAnswerRejected` doc comment can be 2 lines: "True only when the model's answer was the problem: our zod parse, Mastra's strict structured-output error, or an AI SDK parse error. Anything else — 401, rate limit, socket — is rethrown, never retried or quoted back.").
- All files: apply the comment rules. `extract-style.ts` and `address-check.ts` are already close to the bar — light touch only.

- [ ] Step 1: read each file once, list the planned edits per file in the report before editing.
- [ ] Step 2: refactor file by file; `check-types` after each.
- [ ] Step 3: baseline check; diff must be empty (it covers `discover-pages`, `extract-style`, `normalise-url`; `firecrawl.ts`/`index.ts`/Mastra files are covered by `check-types` and by reading — for `callFirecrawl` write the before/after decision table in the report: for each of (fetch throws, text() throws, code=SCRAPE_BRANDING_NOT_SUPPORTED, 401/402/429/5xx, 400 success:false, ok but statusCode≥400, ok but rawHtml<200, ok) the outcome before and after must be the same).
- [ ] Step 4: report — per file: what changed, line count before/after, comments removed/kept; the decision table; the empty diff.

### Task C: review

One reviewer reads every file both tasks touched against the Global Constraints and the two reports, reruns the baseline check once, and verdicts: behaviour frozen (yes/no with evidence), function rules met (list violations with file:line), comment rules met (list comments that still restate the code, and any deleted comment that carried a why). One fix round if needed, then done.

### Task D: live rerun (owner's key)

Once `FIRECRAWL_API_KEY` is in `apps/api/.env`: `scan -- <site> --facts` for the four sites, compare with today's known values (donangie `#971B2F/#3A3E4D/#DAA520`, `(212) 889-8884`, `103 Greenwich Ave`; tartinebakery `ok: true`; fourbarrel `info@fourbarrelcoffee.com`, Oswald; meowmeowtweet `hello@meowmeowtweet.com`, Source Serif Pro, instagram+tiktok). Then delete `apps/api/scripts/_refactor-baseline.ts`.
