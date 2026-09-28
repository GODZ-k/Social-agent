You build the approved **strategy and research** pages in `apps/web` (Round 2 of coding the Cadence redesign). First read the shared rules file and follow it exactly: `docs/handoff/briefs/round2-common.md`.

## Your screens (tracker section 4.2)
- S20a strategy draft with the 30-minute countdown ring, "Start now" and "Ask for changes"; S20b the ask-for-changes dialog (bottom sheet on phone; a redraft gets a fresh 30 minutes); S20c started on its own (when `approvedBy` is null after 30 minutes). Includes "Why this plan", themes with share bars, the posting-times week grid per platform, who it talks to, and "What the agent has learned" (empty state with labelled examples). Mocks: `design/web-v2/screens-s20/`. Route `/c/[clientId]/strategy`.
- S21a research page and S21b running again (current version stays readable, dimmed): `screens-s21/`. Route `/c/[clientId]/strategy/research`, reached from "See the research", with "‹ Strategy". It shows the same findings as onboarding S19b: import `ResearchFindings` from `@/features/research/research-findings` (the onboarding agent builds it now; if it does not exist yet when you need it, build your page around it and leave the import in place, then check again before you finish), plus sources, version and "Run research again".
- Countdown and "started on its own" must come from the data (`approvedBy`, created time), not hardcoded.

## Your files
`apps/web/app/c/[clientId]/strategy/**` and `apps/web/features/strategy/**`. Not `features/research/**` (the onboarding agent owns it).