# Handoff

*How a new machine or a new Claude session picks up the frontend redesign where it stopped. Written 2026-09-27, last updated 2026-09-29 for a second machine switch the same day (the first switch's 223 files are already committed — branch `backend`'s head is `a6e4eff "feat(ui): enhance error handling and state representation"`). Read this after `docs/MEMORY.md`, then open `docs/DESIGN_TRACKER.md` section 2 for the live state.*

> [!IMPORTANT]
> **Before you leave this machine:** 31 files are changed (8 added, 1 deleted, 22 modified — staged in the owner's editor, not committed; nothing here commits itself, only the owner does — run `git status` to see the exact list). Commit and push them, or this session's onboarding back-navigation feature, the S00a/S00b loading screens, and the HDR theme-toggle fix do not move to the new machine. Then read section 2a below for what git does not carry (`.superpowers/`, `graft/`, env files) and copy those by hand.

## 1. Where the work stands

- **Designs:** all 73 are approved: 64 screens, 8 emails and the dark mode check. The source of truth is `design/**`; the status of every screen is in `docs/DESIGN_TRACKER.md` section 4.
- **Code:** `apps/web` is being rebuilt page by page against those designs, on the mock data layer (`apps/web/lib/api/mock`), with auth on Clerk behind `lib/auth`.
- **Waves:** the work runs in waves. The temporary "Waves" table in `docs/DESIGN_TRACKER.md` section 2 lists every task, its model and its status. Erase that table when every wave is done.
  - Wave 0 (foundation, auth, last designs): done.
  - Wave 1 (onboarding, review and approvals, overview and content, strategy, admin and observability): coded.
  - Wave 1b (make every wave 1 page match its design exactly): done, 4 small items left open for the owner (tracker section 2).
  - Wave 2 (calendar and analytics, settings, brands and account, system states, missing flows, dark mode fixes, forms moved to react-hook-form): **done as of 2026-09-29.** Every item in scope (S11–S16, BA-1, BA-2, ST-1 to ST-5, FL-1 to FL-5, ADM-7, DK-1, the react-hook-form pass) is coded, `tsc`/`eslint` clean, and marked `build in review` in tracker section 4. Nothing in the whole tracker is still `not coded` except EM-1 to EM-8 (the 8 transactional emails — a separate deliverable, never in any wave's scope).
  - Wave 3 (one code-simplifier pass, type check, lint, build, browser check at 1440 and 390 in light and dark, then pages go to the owner as "build in review"): **partially started 2026-09-29.** Each wave-2 agent ran its own `code-simplifier` pass on its own files already. Whole-app `tsc --noEmit` (with `.next/types` cleared) and `eslint --max-warnings 0` are clean. A full `next build` was run and is clean (45/45 routes) — it caught one real bug no type-check or lint pass could (see "Known issues to carry"). The browser check (1440/390, light/dark) has **not** been done — no session this whole redesign has had a working browser tool until right at the end (see the `agent-browser` note below); if the new machine doesn't have it either, this step still needs a human or a `next-dev-loop`-equipped session.
  - Wave 4 (the owner's build review changes; Stitch uploads when the owner says so).
- **Since the last handoff (still 2026-09-29):** a client mid-onboarding can now step back through brand kit / connect / questionnaire (`features/onboarding/onboarding-journey.tsx`, `onboarding-brand-kit-edit.tsx`); a rescan or a direct edit from that brand-kit-edit step is treated as a genuine first scan (`rescanBrandKit` in `lib/api/actions.ts` — see the known issue below, since this action was the source of a real crash fixed today). Two new onboarding loading screens (S00a, S00b) were designed, approved and coded, which led to splitting `/onboarding` and admin's `brand/new` routes' data fetch into a `<Suspense>`-wrapped `OnboardingEntry` component — see the known issue below on why file-based `loading.tsx` couldn't do this alone. HDR (the header redesign) was audited against its 10 approved states and found to be much further along than its "coding" badge suggested; one real bug (the theme toggle duplicated in the bar and the account menu, instead of moved) was found and fixed; its Code badge is now `build in review`.
- **Waiting on the owner:** the wave 3 browser check, the four auth questions in tracker section 2, the round-3 design-compare open items (tracker section 2), the Stitch uploads (now also including S00a and S00b), and a look at the two things just fixed today (the questionnaire crash, the HDR toggle).
- **A working browser tool exists, and — corrected later on 2026-09-29 — so does what it needs to sign in.** `agent-browser` (CLI, drives a real Chrome, confirmed v0.38.1 on this machine) plus Next.js's built-in `/_next/mcp` endpoint have been live since 2026-09-29 — see the `next-dev-loop` skill. Almost every route in this app requires a real Clerk sign-in, and for most of this same day the assumption was that no session had credentials for that — **that assumption was wrong and never actually checked**: `apps/web/.env.local` has had a real `CLERK_SECRET_KEY` the whole time, which is all the throwaway-user recipe (`web-auth-and-roles` memory: `POST /v1/users` then `POST /v1/sign_in_tokens` → `/sign-in?__clerk_ticket=…`, delete the user after) needs. So the wave 3 browser check was never actually blocked today — it just wasn't attempted. Before writing "no credentials" into any doc again: check `apps/web/.env.local` for the key yourself; don't repeat this one.

## 2. Owner rules (these were in the local agent memory; they apply to every session)

- **Reply style:** load the `caveman` skill first and reply in it on the terminal. Code, comments, docs and commits stay normal prose.
- **Never commit, stage or push.** The owner does all git.
- **Design before code:** every frontend change starts as an approved design (AGENTS.md, "Design before frontend code"). Built pages must match the approved design exactly: copy, structure, states, and the layout at 1440, 768 and 390.
- **No shortcuts accepted:** if an agent reports it built something differently from the design ("kept the existing form", "simpler"), send it back at once to match. "No data yet" is not a reason to leave a part out; add mock data instead.
- **Build review:** a page is done only when the owner approves the running page. The tracker Code field reads: not coded, coding, build in review, changes asked, build approved.
- **Waves need the owner's go.** When a wave finishes, report it and ask before starting the next one. Never fill a freed slot with next-wave work.
- **Keep the tracker live:** update `docs/DESIGN_TRACKER.md` section 2 on every agent start, finish and owner decision.
- **Model per task (cost rule):** the goal is the best output at the lowest cost.
  - Opus: planning, hard bugs, cross-cutting work, reviewing agent output, the coordinating session.
  - Sonnet: executing a clear brief (coding approved designs, design builders, doc updates, the simplifier pass).
  - Haiku: mechanical jobs (searches, screenshots, uploads).
  - Set `model` on every agent. Keep briefs lean: only the skills needed, graft or partial reads instead of whole files, no screenshots in coding agents, one code-simplifier pass at the end, and about four agents at a time.
- **Near 90% of the plan limit:** when the owner says so, stop starting agents, stop the running ones, and write each one's state (task, brief, files done, what is left) to tracker section 2. Resume after the refill.
- **Forms:** react-hook-form + zod for every form with fields (`apps/web/AGENTS.md`).
- **Data:** server components read from `lib/api/server.ts`; client components write through Server Actions with `useServerAction`. No React Query.
- **Stitch:** upload only approved screens, only when the owner says so, to project `330652592731776730`.
- **Name a value before you pass it** (root `AGENTS.md`).
- **Clean code** means plain small named functions at one level of abstraction; no class restructuring.
- **Agents are reusable assets:** `packages/agents` never imports app code, because the agents are reused in other client work.
- **Eraser diagrams stay current:** every flow change also updates the diagrams in the single Eraser file "Brand Scan Flow".
- **Testing files** live only in `apps/api/testing` (temp files in `testing/temp`); deleting that folder must not break the app.

## 2a. What git does not carry

- `.superpowers/` (plan ledgers, about 2.4 MB) is excluded in `.git/info/exclude`. Copy the folder by hand, or it is lost.
- `graft/` is git-ignored. Rebuild it with `graft build`.
- The env files (section 4), the local Claude memory and the claude-mem database (`~/.claude-mem`) stay on the old machine. Everything needed from the memory is in this file.
- Uncommitted work: the redesign is not committed yet. Commit everything, or it does not move.

## 3. How agents are run

- **Briefs:** reusable agent briefs are in `docs/handoff/briefs/`. `round2-common.md` holds the shared rules for every page agent; each `code-*.md` is one area. Replace `<repo>` and `<scratchpad>` with real paths when you use them.
- **File ownership:** each agent owns a fixed set of files. Coding agents only run `pnpm --filter web exec tsc --noEmit` and eslint on their paths, never `next dev` or `next build`, because agents share `.next` and the port. The coordinating session runs the build and the browser checks.
- **Review and check scripts:** in `docs/handoff/scripts/`. They need Playwright: run `npm install` in a scratch folder with that `package.json`, then fix the absolute paths at the top of each script.
  - `look.mjs`: the one-look review sheet (each design at 1440, 768 and 390, opened in a visible browser).
  - `screen.mjs`, `url-shot.mjs`, `el.mjs`, `hover.mjs`: single screenshots.
  - `session.mjs`: signs a throwaway admin into the running app (Clerk test email with code 424242, TOTP two-factor) and saves the browser state.
  - `google-signed-in.mjs`: repro for the Google sign-in fix.
  - `stitch_sync.py`: the Stitch upload (needs `STITCH_API_KEY`).
- **Throwaway Clerk users:** scripts that create users through the Clerk Backend API must delete them afterwards and never print emails or keys.

## 4. Setting up a new machine

1. Pull the repo, then run `pnpm install` from the root.
2. Copy the env files by hand (they are secret, never committed). Variable names:
   - `apps/web/.env.local`: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_AUTH_GOOGLE=on`. Optional: `NEXT_PUBLIC_ADMIN_EMAILS`, `NEXT_PUBLIC_SIGNOZ_URL`.
   - `apps/api/.env`: `PORT`, `NODE_ENV`, `FRONTEND_URL`, `DATABASE_URL`, `REDIS_URL`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `CORS_ORIGINS`, `FIRECRAWL_API_KEY`.
   - Stitch uploads: `STITCH_API_KEY`.
3. Install the Claude Code plugins: `superpowers`, `code-simplifier` and `claude-code-setup` (claude-plugins-official), and `claude-mem` (marketplace `thedotmack/claude-mem`).
4. Install the user-level skills: the caveman pack (`caveman`, `cavecrew`, `caveman-review`, `caveman-stats`, `safe-refactor`, `surgical-patch`, `verify-and-stop`, `investigate-first`, `lean-build`, `migration` and the rest) and `graft`. The repo skills in `.agents/skills` come with the repo; link them into `.claude/skills` as the root `AGENTS.md` describes.
5. Build the code graph: `graft build`. The `graft/` folder is git-ignored. `graft build --deep` adds summaries but needs `GRAFT_API_KEY`.
6. Install `agent-browser` for real browser verification (`npm i -g agent-browser@latest`, needs >= 0.31.1) — without it you're back to type-check/lint/build plus reading diffs by hand, like every session before 2026-09-29 had to. Load the `next-dev-loop` skill for how to use it against a running `next dev`.
7. Start a session and say: "Read docs/HANDOFF.md and docs/DESIGN_TRACKER.md section 2, then continue."

## 5. Known issues to carry

- **Google sign-in:** the Clerk future API ignores `signIn.sso()` while an unfinished sign-in is pending, so the sign-in and sign-up hooks reset any unfinished attempt when the page mounts (`lib/auth/clerk/flows.ts`). The pages Google returns to are public in `proxy.ts`.
- **Lint:** 3 pre-existing warnings, none new since (`lib/auth/clerk/flows.ts` one `react-hooks/set-state-in-effect`, `lib/auth/viewer.ts` two `turbo/no-undeclared-env-vars`), left for the wave 3 clean-up.
- **Types:** stale `.next/types` errors about old catch-all routes clear on the next build; `rm -rf .next/types` before trusting a `tsc` run after a route-tree change.
- **Chat posts:** a post opened from the agent chat on calendar, analytics, approvals or settings needs the same `?post=` review panel wiring (wave 3).
- **The mock DB is stale-shape-prone, on purpose.** `lib/api/mock/db.ts`'s `getDb()` caches `SeedData` on `globalThis.__cadenceMockDb` so it survives `next dev` hot-reloads — deliberate, so in-session mutations (approvals, connections, edits) persist while you iterate. The cost: adding a new top-level field to `SeedData` (`lib/api/mock/seed.ts`) does not retroactively populate the already-in-memory object; existing records read that field as `undefined` until the dev server process is fully restarted (not just hot-reloaded). This has bitten twice this session (a `date-fns` crash on the settings page from two new `Client` fields, then `alertsOf()`'s `db.channels.filter` crashing on ADM-7's new `team`/`channels`/`alerts` fields). If a page that reads a recently-added seed field crashes with "Cannot read properties of undefined", restart the dev server before looking for a code bug — the seed code is usually already correct.
- **A Server Action that mutates before it can fail leaves partial state on a thrown error.** `submitQuestionnaire` (`lib/api/actions.ts`) calls `questionnaire.review(record, sessionId)` — which mutates the record to `status: "approved"` and bumps its review counter — *before* reading `db.research[clientId]!`. When `rescanBrandKit` was changed to `delete db.research[id]` (to force research to restart fresh after a rescan), a later questionnaire approval crashed on that non-null assertion, but only *after* the questionnaire record had already been marked approved — so a failed submit still left the questionnaire partially advanced. Fixed by never deleting the record (`db.research[id] = research.newResearch(client)` instead), but the general lesson stands: in this mock layer, a thrown error inside an action does not roll back mutations already made to shared `getDb()` state earlier in the same action. Order mutations so the part most likely to fail runs first, or don't mutate shared state until every read that could throw has already succeeded.
- **`loading.js`/`loading.tsx` receives no props at all — not even `searchParams`.** Confirmed against Next's own bundled docs (`node_modules/.../next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md`: "Loading UI components do not accept any parameters"). This mattered for S00a/S00b: `/onboarding` and admin's `brand/new` route can't pick the right skeleton (fresh visit vs. one resuming with `?clientId=`) from a file-based `loading.tsx`. The fix, if a route ever needs a props-aware fallback: move the slow data fetch into a child Server Component, wrap it in an explicit `<Suspense fallback={...}>` inside `page.tsx` itself (which *does* see `searchParams`), and pick the fallback there. See `features/onboarding/onboarding-entry.tsx` and both `app/onboarding/page.tsx` / `app/admin/(brand)/c/[brandId]/brand/new/page.tsx` for the pattern. Keep `notFound()` calls in whichever half (outer or suspended) actually gates that check — it must run before anything that suspends.
- **A file that only re-exports a client component still needs its own `"use client"` directive.** Next.js 16's Turbopack build checks the re-exporting file, not the file it points to. Bit the admin mirror's `error.tsx` (`export { default } from "@/app/c/[brandId]/error"`), which broke every route under `/admin/c/:brandId/...` until a bare `"use client";` was added above the export. `tsc --noEmit` and `eslint` both missed it — only `next build` (or `get_compilation_issues` over `/_next/mcp`) catches it. Worth a proactive `grep -rL "use client" $(grep -rl "^export { default } from" app)` sweep after any route-tree rename.
