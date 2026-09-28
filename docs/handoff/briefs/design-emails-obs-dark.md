You do three design jobs for the Cadence app as static HTML mockups. Design only; the owner reviews before anything is uploaded or coded.

## Job 1: emails
Design the product's emails as email-safe HTML (table layout, inline styles, 600px max, works at 390 wide, web-safe font fallbacks for Bricolage Grotesque and Instrument Sans, no background images for meaning, dark-mode friendly colours): invite a client (from the admin), sign-in code (6 digits, 10 minutes), password reset link (30 minutes), password changed notice, "posts are waiting for your approval" (count, first post's platform and format, time, one button), post failed to publish (network, reason, fix button), connection expired (approved posts waiting). Plain words, sentence case, no middle dots; never reveal whether an account exists in reset emails. Match `docs/DESIGN.md` and the approved auth screens (`design/web-v2/screens-auth/`).
- Create ONLY `design/emails/build.py` and `design/emails/out/em-v1-<email>.html`.

## Job 2: make OBS-2 Agents and OBS-3 Run detail responsive
They were approved as desktop designs (`design/observability/build.py` functions `agents()` and `run_detail()`, output `design/observability/screens/agents.html`, `run-detail.html`). The v3 set (`design/observability/obs_v3.py`, `screens-v3/`) is approved and responsive: match its tab bar (Overview, Agents, Server, Frontend), phone patterns (stacked rows, narrow charts) and look. Keep the content; only make it work at 768 and 390 without sideways scrolling.
- Create ONLY `design/observability/obs_v3_agents.py` writing `design/observability/screens-v3/obs-v3-agents.html` and `obs-v3-run-detail.html`. Do NOT edit `build.py` or `obs_v3.py`; import them.

## Job 3: dark mode check
`docs/DESIGN.md` defines dark tokens; only the header has a dark mock (`design/web-v2/screens-hdr/hdr-v1-client-dark.html`). Render a sample of approved screens in dark (S03, S06, S08, S09, S11, S12, S13, one auth screen, one admin screen) by adding the dark theme attribute or class the way the header dark mock does, and list every problem (hard-coded light colours, low contrast, invisible borders, charts). Write a short report `design/dark-check/REPORT.md` with a screenshot per screen and a fix for each problem (which CSS rule, what value). Put any proposed dark overrides in `design/dark-check/dark-overrides.css`. Do NOT edit app.css or any approved design; this is a report plus proposal.
- Create ONLY `design/dark-check/` files.

## Read first
- Repo `<repo>`. `docs/DESIGN.md`, `docs/DESIGN_TRACKER.md` (read only).
- Load skills with the Skill tool first: `frontend-design`, `apple-design`, `web-design-guidelines`.

## Rules
- Do NOT edit any file outside the ones listed above, docs, the tracker, apps/ or packages/. No git, no Stitch, no review browser windows. Fixed hex/rgba, never `color-mix()`.
- Screenshots in `<scratchpad>/misc/`. Copy `<scratch>/shot.mjs` to `<scratch>/misc/shot-misc.mjs` and change port 9444 to 9614 (`<scratch>` is the scratchpad path above). Emails: shoot at 600 and 390 mobile; observability at 1440, 768 mobile and 390 mobile. Read every PNG and fix problems.

## Report back (short)
Files with paths per job, key decisions, the dark-mode problems found, questions for the owner.