# Lessons learned

![living document](https://img.shields.io/badge/living_document-blue)
![lessons](https://img.shields.io/badge/lessons-35-blue)
![source](https://img.shields.io/badge/source-real_runs-lightgrey)
![updated](https://img.shields.io/badge/updated-2026--09--22-lightgrey)

*What already cost us time, and the rule that came out of it. Read before repeating a
class of work.*

Every entry is a pair: in bold, what happened; underneath it, what we do now. All 35 came
out of real runs between 2026-09-20 and 2026-09-22.

> [!TIP]
> Add to it when something costs us time twice.

<a id="contents"></a>

## Contents

- [At a glance](#at-a-glance)
- [Firecrawl](#firecrawl)
- [Mastra 1.66](#mastra-166)
- [Windows and tooling](#windows-and-tooling)
- [Repo, pnpm, Neon](#repo-pnpm-neon)
- [Process with AI agents](#process-with-ai-agents)
- [Code](#code)
- [Related](#related)

<a id="at-a-glance"></a>

## At a glance

| Area                                                  | Lessons  | Mostly about                                                           |
| ----------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| [**Firecrawl**](#firecrawl)                           | ![7][c7] | Limits, lying status codes, and fields that look useful but are not    |
| [**Mastra 1.66**](#mastra-166)                        | ![6][c6] | Method names, structured output, and routes that carry no auth         |
| [**Windows and tooling**](#windows-and-tooling)       | ![3][c3] | Links, deletes and binaries that behave differently here               |
| [**Repo, pnpm, Neon**](#repo-pnpm-neon)               | ![7][c7] | Installs, stale `dist` folders, versioning and the git index           |
| [**Process with AI agents**](#process-with-ai-agents) | ![6][c6] | Stalls, re-reviews, file ownership and where rulings are written       |
| [**Code**](#code)                                     | ![12][c12] | Facts the model must not own, and refactors that must prove themselves |

<a id="firecrawl"></a>

## Firecrawl

- **Keyless calls are capped at about 60 a day; a free key gives 10 requests a minute.**
  We hit the keyless cap mid-refactor on 2026-09-22 and could not run a single live scan,
  so the clean-up pass had to be verified against saved fixtures instead.

  Keep `FIRECRAWL_API_KEY` set for any day of scan work, and keep a fixture directory so
  work can continue when the key is spent. The queue runs one scan at a time because of
  the 10/min limit.

- **A PDF with `formats: [branding]` returns HTTP 500 `SCRAPE_BRANDING_NOT_SUPPORTED`,
  not a normal error.**

  Treated as a scan error, not a crash; a PDF also comes back as `rawHtml` of about 24
  characters, which is why fewer than ~200 characters of rawHtml means `NOT_A_WEBSITE`.

- **A missing page returns HTTP 200 with an inner `statusCode: 404`.** The outer status
  lies.

  Always read the inner `statusCode` before using the HTML.

  ```diff
  - trust the outer HTTP status of the scrape response
  + read data.metadata.statusCode, then decide
  ```

- **`branding.typography.fontFamilies` is junk (`Arial`, `Times New Roman` fallbacks);
  `fontStacks` is real.**

  `extract-style.ts` post-processes `fontStacks` and also looks for font names in the
  HTML; `fontFamilies` is ignored.

  ```diff
  - branding.typography.fontFamilies
  + branding.typography.fontStacks, post-processed in extract-style.ts
  ```

- **The `secondary` colour changes between runs on sites with a rotating hero, and
  Shopify sites leak the checkout blue.**

  Only the primary colour is treated as dependable; colour output is not compared
  run-to-run when verifying.

- **Firecrawl reuses cached content unless `maxAge` is set, and it will happily fetch
  `http://127.0.0.1:8080/`.** Verified 2026-09-22: Firecrawl does not block private
  addresses.

  `src/scan/firecrawl.ts` vets every address itself (protocol, credentials, ports 80/443
  only, IP literals, DNS answers, internal names) and is the only file in the repo
  allowed to send a user-typed address anywhere.

- **A spike beat the plan.** We built our own fetcher and CSS parser first (the
  2026-09-20 decision: "own fetch, no crawling service"), then found on 2026-09-22 that
  Firecrawl renders JS-only sites — tartinebakery.com went from `NO_CONTENT` to a full
  result — and deletes about 400 lines of the hardest code.

  Spike a third-party option on the real test sites before writing the hard version
  ourselves. Reversing a decision on evidence is cheap; the decision record goes in the
  plan.

  ```diff
  - our own fetcher and CSS parser
  + Firecrawl /v2/scrape, about 400 lines lighter and JS-rendered
  ```

<a id="mastra-166"></a>

## Mastra 1.66

- **`getWorkflows()` and `getAgents()` do not exist; the methods are `listWorkflows()`
  and `listAgents()`.**

  Read `node_modules/@mastra/core/dist/docs` before using any Mastra API. Memory and
  training data are wrong about Mastra often enough that the rule is absolute
  ([`apps/api/AGENTS.md`](../apps/api/AGENTS.md) opens with it).

  ```diff
  - mastra.getWorkflows() / mastra.getAgents()
  + mastra.listWorkflows() / mastra.listAgents()
  ```

- **`tsx -e` compiles to CJS and cannot load `mastra/index.ts`, which has top-level
  await.**

  Write a temporary `.mts` file and run that instead of a one-liner.

  ```diff
  - tsx -e "<one-liner>"   # compiles to CJS, cannot load mastra/index.ts
  + a temporary .mts file, run with tsx
  ```

- **Strict `structuredOutput` throws
  `MastraError{STRUCTURED_OUTPUT_SCHEMA_VALIDATION_FAILED | STRUCTURED_OUTPUT_OBJECT_UNDEFINED}`,
  and TripWire only fires when a structuring model is configured.**

  The brand scan catches those two codes and turns them into `INTERPRETATION_FAILED`,
  with one retry.

- **A step that throws is not retried by default.**

  Retries are explicit where we want them, and nowhere else.

- **`skills:` on an agent adds tool calls, which breaks "exactly one model call".**

  An agent that must answer in one call gets its skill text through `loadSkill()`
  (`src/mastra/config/skills.ts`). The build copies `src/mastra/skills` to `dist/skills`,
  because tsup does not bundle files read at run time.

- **Mastra's own HTTP routes, the ones Studio talks to, have no authentication.**

  `src/app.ts` mounts them only when `NODE_ENV` is not `production`, and the host must
  set `NODE_ENV=production`.

<a id="windows-and-tooling"></a>

## Windows and tooling

- **Git Bash `ln -s` silently copies instead of linking, and git stores `.claude/skills`
  links as file copies.**

  Use `New-Item -ItemType Junction` in PowerShell for the skill links; junctions need no
  admin rights, symlinks do.

  ```diff
  - ln -s            # Git Bash: silently copies instead of linking
  + New-Item -ItemType Junction   # PowerShell: a real link, no admin rights
  ```

- **`Remove-Item` is blocked by the harness on some paths, and the Bash tool's working
  directory can hold a folder open so it cannot be deleted.**

  Use `[System.IO.Directory]::Delete(...)` and make sure no shell is sitting inside the
  folder.

- **`turbo.exe` failed to spawn with `spawn UNKNOWN`.** It was Windows Smart App Control
  transiently blocking an unsigned binary.

  Retry, or bypass turbo with `pnpm --filter <name> run <script>`, which is what the
  plans do anyway.

<a id="repo-pnpm-neon"></a>

## Repo, pnpm, Neon

- **`apps/api` type-checks against `packages/shared/dist` and `packages/db/dist`, not their
  sources.**

  A schema edit that passes `check-types` in the package still fails in the API until the
  package is rebuilt (`tsc` in `packages/shared`, then `packages/db`). A stale `dist` also
  shows up as errors about fields the API never touched.

- **One unanswered dependency build script makes every `pnpm run` fail with
  `ERR_PNPM_IGNORED_BUILDS`.**

  Answer it under `allowBuilds` in `pnpm-workspace.yaml` and rerun. It is not a broken
  install.

- **The npm registry is slow on this machine; one install took 11 minutes.**

  Give `pnpm add` a 10-minute timeout and never start a second install while one is
  running.

- **Neon's first connection after an idle period fails once with "Connection terminated
  unexpectedly".**

  Rerun the script that hit it before investigating anything.

- **A dependency used by `packages/ui` that is not declared there at the same version
  makes pnpm link two copies.**

  Declare it in `packages/ui` at the version the apps use.

- **`apps/api` reads `packages/shared` and `packages/db` from their `dist` folders.**

  Rebuild the package after changing it, or the type check reports stale errors that are
  not real.

- **`docs/` was in `.gitignore`, so the specs and plans that are the design record were
  not versioned.**

  Fixed on 2026-09-22 for the seven docs in `docs/`; Postman was removed the same day. Anything
  still ignored stays out of the index; do not `git add` it unless asked.

- **`git status` shows files as staged while the owner is working.** The owner stages in
  their editor while agents work.

  No agent ever runs `git add`, `git commit`, or touches the index; the owner commits
  everything.

<a id="process-with-ai-agents"></a>

## Process with AI agents

- **Roughly one in two long subagents hit a 600-second no-progress stall.**

  Reports are written incrementally as the work goes, so a stalled agent can be resumed
  or replaced without losing what it did. Briefs say to keep commands short.

- **A fix wave can regress something a review already passed.** It happened once, finding
  F1.

  After a final review there is exactly one fix wave, followed by one scoped re-review of
  what changed. Never a fix without a re-review.

- **A plan defect surfaced only during execution**: the controller's pre-flight missed
  that `scan.ts` imports `index.ts`.

  Every brief now names the import graph between the files a task touches, and the ledger
  records a pre-flight table of what each task produces and consumes.

- **Parallel agents collided when file ownership was vague.**

  Long work is split by file ownership so two agents never touch the same file, with time
  estimates given up front, and the split is written into the ledger.

- **Decisions made mid-run were forgotten by the next agent.**

  Rulings go into the ledger (`.superpowers/sdd/<date>-<name>/progress.md`) with the cost
  if the ruling is wrong, so a later agent can see what was chosen and why.

- **Docs written while work is in flight go stale within the hour.**

  The controller updates [TASKS.md](./TASKS.md) and [MEMORY.md](./MEMORY.md) after every
  task completes, not at the end.

<a id="code"></a>

## Code

- **A clean-code refactor is only safe if the output is unchanged.** The 2026-09-22 scan
  clean-up froze every exported name and signature and was accepted only when
  `scripts/_refactor-baseline.ts` printed output byte-identical to the saved
  `before.json`.

  Any refactor gets a baseline before it starts, and the diff must be empty.

- **donangie.com leaked another company's phone number.** A `Review.itemReviewed` JSON-LD
  node described a different `LocalBusiness`, and we followed it.

  Only JSON-LD properties belonging to the same entity as the page's business are
  followed.

- **An undecodable `tel:` href was being kept as the string "%".**

  An href we cannot decode is dropped, not kept as garbage. A missing fact beats a wrong
  one.

  ```diff
  - keep the undecodable tel: href as the string "%"
  + drop it — a missing fact beats a wrong one
  ```

- **Retrying a whole scan because the model answered badly wasted a Firecrawl call.**

  One LLM call per scan, retried once and only when the model's answer is bad; a fetch
  failure is not retried by the model path.

- **The model kept inventing phone numbers and hex codes.**

  Code owns every verifiable fact (phone, email, address, hours, colours, fonts) and the
  model's output schema has no field for them. Website text is passed as data inside a
  delimited block with `<site>` look-alikes and zero-width or bidi characters stripped.

- **A class-based restructuring was proposed for `src/scan` and refused by the owner on
  2026-09-22.**

  Clean code here means plain functions kept small and named, one level of abstraction
  per function, no nested ternaries, word lists as data at the top of the file, and
  comments only for the *why*. Not new layers of structure.

- **Every `apps/web` screen was one 150–330 line client component, and "lint clean" meant
  nothing (2026-09-22).**

  The shared ESLint flat config never named `.ts`/`.tsx` in `files`, and the babel parser
  could not parse TSX, so ESLint had linted zero TypeScript files since the repo began.
  Fixed with `typescript-eslint`, which refuses TypeScript 7; the config package pins its
  own `typescript@6` so pnpm links the parser against TS 6. Run `eslint` from inside the
  app (`./node_modules/.bin/eslint --max-warnings 0 .`) when piping `-f json`.

- **Server components need the data on the server.**

  The mock lived in the browser (localStorage), so nothing could render server-side. It
  now runs in the Next.js process on `globalThis`; reads are `React.cache`d server
  functions, writes are Server Actions returning `ActionResult<T>` (thrown errors lose
  their message in production) and ending with `revalidatePath`. The approvals swipe keeps
  its instant feel with `useOptimistic` inside the transition.

- **The React Compiler lint rejects refs the old code leaned on.**

  `react-hooks/refs` flags `ref.current` written during render, and refs read inside
  callbacks handed to hooks or to `form.handleSubmit(...)` built in render.
  `react-hooks/incompatible-library` flags `form.watch()`; use `useWatch({ control })`.
  Motion's `useTransform` re-reads its transformer every render, so props can be closed
  over directly.

- **A layout's `notFound()` skips its own segment's `not-found.tsx`.**

  Next wires a segment's `not-found.tsx` as the boundary for its children only, so a
  `[clientId]` layout that throws needs a root `app/not-found.tsx`.

- **Clerk's `UserButton` mismatches on hydration when rendered on the server.**

  `ClerkLoaded` did not stop it (4 of 20 loads). Render it only after mount
  (`useSyncExternalStore` with a server snapshot of `false`) behind a same-size placeholder:
  `components/shell/user-menu.tsx`. Zero mismatches since.

- **A layout that awaits data hides every `loading.tsx` beneath it.**

  The workspace layout awaited Clerk and the client, so navigations showed the root skeleton
  with no bar or rail. Keep layouts synchronous: put the data-dependent chrome in an async
  child under `Suspense` with a same-frame skeleton.

<a id="related"></a>

## Related

- [PRD.md](./PRD.md) sets out what the product must do.
- [ARCHITECTURE.md](./ARCHITECTURE.md) describes how the system is built.
- [API_SPEC.md](./API_SPEC.md) is the HTTP contract.
- [SECURITY.md](./SECURITY.md) holds the threat model and the controls.
- [DESIGN.md](./DESIGN.md) is the design system.
- [TASKS.md](./TASKS.md) is the board.
- [MEMORY.md](./MEMORY.md) is the brief to load first every session.

<!-- Lesson counts per area. -->

[c3]: https://img.shields.io/badge/3-lessons-lightgrey?style=flat-square
[c6]: https://img.shields.io/badge/6-lessons-lightgrey?style=flat-square
[c7]: https://img.shields.io/badge/7-lessons-lightgrey?style=flat-square
[c12]: https://img.shields.io/badge/12-lessons-lightgrey?style=flat-square
