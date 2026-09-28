You build the approved **settings** pages in `apps/web` (Round 2 of coding the Cadence redesign). First read the shared rules file and follow it exactly: `docs/handoff/briefs/round2-common.md`.

## Your screens (route `/c/[clientId]/settings`; tracker section 4.3)
- Tabs: Brand kit, Social accounts, Preferences (one pill tab bar; fills the width on phone without icons; Social accounts gets an amber dot when something needs attention).
- S13 brand kit: the same cards as onboarding S17a (the business, contact details, who it's for, how you sound, how you look, where to post); contact facts say "Not on your site" when missing; edit one card at a time with Cancel and Save. Mocks: `design/web-v2/screens-s13/`.
- S14 social accounts: in your posting plan and not in your plan; connected by, last checked, access runs out; expired access with reason, posts waiting, Reconnect; none connected; connect failed (`missing_scopes`). Mocks: `screens-s14/`.
- S15 preferences: timezone, post language, chat language, approval emails; human approval and the 30-minute start shown as always on; changes save on their own with a toast; the stop or remove card with Archive and Delete. Mocks: `screens-s15/`.
- S16 delete: lists what gets deleted with counts; "Archive instead"; type the brand name to enable "Delete for good"; archived state with Restore (`archiveBrand`, `restoreBrand`; a real delete does not exist in the API: keep the Delete button but have it call archive and note it in your report). Dialog on desktop, bottom sheet on phone. Mocks: `screens-s16/`.

## Your files
`apps/web/app/c/[clientId]/settings/**` and `apps/web/features/settings/**`. If the brand kit cards are shared with onboarding S17a, do not edit `features/brand-kit/**` (the onboarding agent owns it); build the settings cards in your folder, reusing brand-kit pieces by import only.