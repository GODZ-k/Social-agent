You build the approved **overview, agent chat and content** pages in `apps/web` (Round 2 of coding the Cadence redesign). First read the shared rules file and follow it exactly: `docs/handoff/briefs/round2-common.md`.

## Your screens (tracker section 4.3)
- S03 overview (`/c/[clientId]`): next step card, where the agent is (loop), "This week" (7-day grid on desktop, day-by-day list below 900px, legend, "Open calendar", post cards with preview, platform, format and "Needs approval"; tapping a card opens the post), stat tiles, brand kit summary; header button "Ask for changes" (opens the strategy page's ask-for-changes dialog: link to `/c/[clientId]/strategy?ask=1`). Mock: `design/web-v2/screens-s03/s03-v3-overview.html`.
- S04 agent chat panel (side panel, full screen on phone; posts in chat show platform and format and open when tapped): `screens-s04/`. Current code: `apps/web/features/agent/`.
- S06 content list (`/c/[clientId]/content`): "Where it goes" column, soonest first with "In 3 days", status tabs, platform filter, search, a Review button on posts that need approval, row hover as one unit, cards below 900px: `screens-s06/`.
- S07 needs approval filter with "Review one by one": `screens-s07/`.
- Opening a post (from This week, chat, the content list) opens the review panel S08, which another agent builds as `ReviewPostSheet` in `apps/web/features/post/review-post-sheet.tsx`. Open it through the URL (`?post=<id>` on the current page) and render `<ReviewPostSheet postId=... />` from that file; if it does not exist yet, leave the import and check again before you finish.

## Your files
`apps/web/app/c/[clientId]/page.tsx`, `apps/web/app/c/[clientId]/content/**`, `apps/web/features/overview/**`, `apps/web/features/agent/**`, `apps/web/features/content/**`. Not `features/post/**` or `features/approvals/**` (another agent).