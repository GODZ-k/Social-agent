You build the approved **onboarding** pages in `apps/web` (Round 2 of coding the Cadence redesign). First read the shared rules file and follow it exactly: `docs/handoff/briefs/round2-common.md`.

## Your screens (route `/onboarding`; tracker section 4.1)
- S01 website step: `design/web-v2/screens-s01/s01-v3-empty.html`, `-typed.html`, `-error.html`.
- S02 scanning (v4 running) and scan failed (v3): `screens-s02/s02-v4-running.html`, `s02-v3-failed.html` ("Fill it in" links to the brand kit form, which is not designed yet: link it to a clearly marked TODO route).
- S17a check your brand kit, S17b connect accounts (optional, "Skip, connect later"), S17c Instagram connected: `screens-s17/`.
- S18a–f questionnaire chat (language pick; confirm; "Something else" and "Not quite, let me fix it" typing chips that open the text box only when tapped; follow-up; summary with "Looks right, start research"; change an earlier answer inline on desktop and as a bottom sheet on phone): `screens-s18/`.
- S19a–c research running, done, stopped: `screens-s19/` ("See your first month" goes to the strategy page).
- The onboarding step bar shows on every onboarding screen at every size; on phone only the current step keeps its label. Use `OnboardingHeader`.

## Your files
`apps/web/app/onboarding/**`, `apps/web/features/onboarding/**`, `apps/web/features/brand-kit/**`, and new `apps/web/features/questionnaire/**` and `apps/web/features/research/**`. The research findings component (S19b) will also be used by the research page (S21, another agent): export it from `apps/web/features/research/research-findings.tsx` as `ResearchFindings({ research })` so they can import it; build it first.