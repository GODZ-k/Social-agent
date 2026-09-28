# Design tracker

![approved](https://img.shields.io/badge/approved-52-brightgreen)
![in review](https://img.shields.io/badge/in_review-12-orange)
![build approved](https://img.shields.io/badge/build_approved-0_of_64-blue)
![updated](https://img.shields.io/badge/updated-2026--09--26-lightgrey)

*Every frontend screen from design to code: where the design is, whether the owner approved it, whether it is on Stitch, and whether `apps/web` has it.*

The frontend twin of [`TASKS.md`](./TASKS.md). Update it in the same change as any design, approval, upload or coding step.

<a id="contents"></a>

## Contents

- [1. At a glance](#1-at-a-glance)
- [2. Waiting for the owner](#2-waiting-for-the-owner)
- [3. How it works](#3-how-it-works)
- [4. Screens](#4-screens)
  - [4.1 Onboarding](#41-onboarding)
  - [4.2 Strategy and research](#42-strategy-and-research)
  - [4.3 Brand workspace](#43-brand-workspace)
  - [4.4 Header](#44-header)
  - [4.5 Auth](#45-auth)
  - [4.6 Admin](#46-admin)
  - [4.7 Observability](#47-observability)
  - [4.8 Your brands and account](#48-brands-and-account)
  - [4.9 System states](#49-system-states)
  - [4.10 Missing flows](#410-missing-flows)
  - [4.11 Emails](#411-emails)
  - [4.12 Dark mode check](#412-dark-mode-check)
- [5. Rules to carry into code](#5-rules-to-carry-into-code)
- [6. Backend follow-ups](#6-backend-follow-ups)
- [7. Stitch to-do](#7-stitch-to-do)
- [8. Decided questions](#8-decided-questions)
- [9. Change log](#9-change-log)

<a id="1-at-a-glance"></a>

## 1. At a glance

| Area                                              |      Screens | Design approved | Design in review | Build approved |
| ------------------------------------------------- | -----------: | --------------: | ---------------: | -------------: |
| [Onboarding](#41-onboarding)                       |           14 |              14 |                0 |              0 |
| [Strategy and research](#42-strategy-and-research) |            5 |               5 |                0 |              0 |
| [Brand workspace](#43-brand-workspace)             |           13 |              13 |                0 |              0 |
| [Header](#44-header)                               |            1 |               1 |                0 |              0 |
| [Auth](#45-auth)                                   |            7 |               7 |                0 |              0 |
| [Admin](#46-admin) | 7 | 6 | 1 | 0 |
| [Observability](#47-observability)                 |            6 |               6 |                0 |              0 |
| [Your brands and account](#48-brands-and-account)  |            2 | 2 | 0 |              0 |
| [System states](#49-system-states)                 |            5 | 5 | 0 |              0 |
| [Missing flows](#410-missing-flows)                |            5 | 5 | 0 |              0 |
| [Emails](#411-emails) | 8 | 8 | 0 | 0 |
| [Dark mode check](#412-dark-mode-check) | 1 | 1 | 0 | 0 |
| **Total** | **74** | **73** | **1** | **0** |

OBS-1 and OBS-4 moved to v3; v2 stays only as history. S05 is retired and not counted. ADM-7 Admin settings v1 built 2026-09-28, awaiting owner review (one-look sheet ready).

<a id="2-waiting-for-the-owner"></a>

## 2. Waiting for the owner

Updated with every agent start, finish and owner decision.

**Needs your approval now**

| What              | Items                                                            | Where to look                     |
| ----------------- | ---------------------------------------------------------------- | --------------------------------- |
| Stitch uploads    | Approved screens not yet uploaded; waits for your go             | [section 7](#7-stitch-to-do)       |
| Built pages       | None yet; each page lands here as "build in review"              | [section 4](#4-screens)            |
| Wave 1 close-out  | Wave 1 is done; 4 small items left open from the round 3 compare, and the wave 2 go | [section 2, below](#2-waiting-for-the-owner) |
| ADM-7 design v1   | Admin settings (Team + Notifications) built and self-checked; needs your approve/reject | [section 4.6](#46-admin), [one-look review](http://127.0.0.1:5500/design/web-v2/review-admin-settings.html) |

**Open items from the round 3 design compare (2026-09-28), left for you rather than guessed**

| Screen | Item | Recommendation |
|---|---|---|
| admin-client-detail | `packages/ui`'s `loop-track.tsx` shows a 3×2 grid of the 6 labelled segments at 768/390; the design wants one compact row | Needs a `packages/ui` owner in a later wave; out of any single group's scope this round |
| admin-client-detail | Shows the client's full name ("Priya Raman"); design shows first name only ("Priya") | Confirm this is deliberate copy, not placeholder text, before adding first-name-extraction logic |
| S09 (approvals, 390) | The fixed bottom tab bar appears to overlap the action row in the screenshot | Likely a screenshot-stitching artifact from capturing fixed-position chrome, not a real bug; check by eye once |
| S18 (non-language question types) | No screenshot pair exists for the "Tap one to start..." helper line on other chip question types | Can't verify without a captured pair; flagged, not guessed |

**Open questions from the auth build**

| From | Question | Recommendation |
|---|---|---|
| AUTH-4 | The approved design resets the password with a link; Clerk sends a 6-digit code. The code flow uses the same screens with "code" in place of "link" | Keep the code on Clerk; the link design comes back with Better Auth |
| AUTH-5 | The invite page should name the inviter and the brand ("Priya Shah invited you to Cadence for Tartine Bakery") with an invite card; the invite carries only the email today | Add the inviter and brand to the invite's metadata (backend follow-up) |
| AUTH-3 | "2 tries left" after a wrong code: Clerk does not report the tries left | Leave it out on Clerk |
| AUTH-7 | "You have 3 backup codes left": Clerk does not report the count | Leave it out on Clerk |


**Waves (temporary: erased when every wave is done)**

Five waves in all. Each wave starts only on the owner's go. Wave 1b is running (started after the refill) (every built page must match its approved design exactly), then wave 2 on the owner's go.

| Wave | Task | Screens | Model | Status |
|---|---|---|---|---|
| 0 | Coding round 1: header, navigation, shared post pieces, mock data layer | Foundation | Opus | done |
| 0 | Auth on Clerk behind `lib/auth` (Better Auth can replace it without touching components) | AUTH-1 to AUTH-7 | Opus | done; owner's changes fixed on all auth screens (Google button, title, post art, footer, copy); sign-in checked in the browser at 1440 and 390 |
| 0 | Designs: OBS-2 and OBS-3 responsive, emails, dark mode report | OBS-2, OBS-3, emails, dark check | Opus, then Sonnet | done, all approved |
| 1 | Code onboarding | S01, S02, S17, S18, S19 | Sonnet | coded; two gaps from the design, fixed in wave 1b |
| 1 | Code review post, approvals, viewer | S08, S09, S10 | Sonnet | coded; type check and lint clean; waits for the wave 3 browser check |
| 1 | Code overview, agent chat, content | S03, S04, S06, S07 | Sonnet | coded; type check and lint clean; wave 3: a post opened from the chat on calendar, analytics, approvals or settings needs the same `?post=` panel |
| 1 | Code strategy and research | S20, S21 | Sonnet | coded; type check and lint clean; waits for the wave 3 browser check |
| 1 | Code admin and observability | ADM-1 to ADM-6, OBS-1 to OBS-6 | Sonnet | coded; parts left out, built in wave 1b |
| 1b | Onboarding: S17a brand kit as separate cards, one card edited at a time (Edit, Cancel, Done); S18 short answer labels ("You sell", "Posts should") | S17a, S18 | Sonnet | done: cards, source captions, contact values, platform handles, short labels, \"Change something\"; opening hours edits are not saved yet (they are stored per day); browser check after the dev server restart |
| 1b | Admin and observability: build what was left out, on mock data (server logs, SigNoz links, run again, date range and filter, the ADM-4 "brand kit ready to check" card, "Add a brand" beside the client's name) | ADM-4, OBS-2 to OBS-5 | Sonnet | done: logs, SigNoz links, run again, date range and filter on every tab, the \"brand kit ready to check\" card, \"Add a brand\" beside the name; browser check after the dev server restart |
| 1b | Design match check: every wave 1 page against its approved design at 1440, 768 and 390; any gap goes back to be fixed | All wave 1 pages | Sonnet (screenshots), Sonnet (compare) | done: round 1 ~150 gaps, round 2 ~80 gaps, round 3 (fresh recapture after all routes landed) found 17 more and fixed them; 4 left open for the owner (see below); type check, lint and build all clean; full route check 38/38 OK |
| 1b | Admin adds a brand through the full client onboarding flow (owner, 2026-09-28) | ADM-5, S01 to S19 | Sonnet | done: \"Add a brand\" opens onboarding for that client with the admin header; skip or send a connect link; answers marked \"Answered by the agency\" |
| 1b | Admin routes (owner, 2026-09-28): one word only, `c`, for every admin brand route — `/admin/c/:clientId/brand/new` for onboarding, `/admin/c/:brandId/...` for an admin viewing a brand (same pages as `/c/...`, admin-only); `/c/:brandId` redirects admins there | ADM-4, ADM-5, ADM-6 | Sonnet | done: `basePath` threaded through ~20 files; the workspace layout and pages moved one level deeper into a `(workspace)` route group so `brand/new` (no brand yet) sits outside its chrome — fixes a double-header bug caught by the owner moving the folder by hand; verified single header, build clean |
| 2 | Design admin settings (ADM-7): what it holds, then the one-look review | ADM-7 | Sonnet | waits for the owner's go |
| 2 | Code calendar and analytics | S11, S12 | Sonnet | waits for the owner's go |
| 2 | Code settings | S13, S14, S15, S16 | Sonnet | waits for the owner's go |
| 2 | Code your brands and account, system states, missing flows | BA-1, BA-2, ST-1 to ST-5, FL-1 to FL-5 | Sonnet | waits for the owner's go |
| 2 | Dark mode fixes into the real CSS (`packages/ui` tokens, brand tints) | DK-1 | Sonnet | waits for the owner's go |
| 2 | Move the forms that skip react-hook-form onto it with zod (sign-in, sign-up, verify email, forgot and reset password, invite, two-factor codes, the ask-for-changes dialogs) | AUTH-1 to AUTH-7, S08, S20b | Sonnet | waits for the owner's go |
| 3 | One clean-up pass over all new code | All coded pages | Sonnet | waits for the owner's go |
| 3 | Type check, lint, build, browser check at 1440 and 390, light and dark; pages go to the owner as "build in review" | All coded pages | Opus (checks), Haiku (screenshots) | waits for the owner's go |
| 4 | Changes the owner asks for in the build review, until each page is "build approved" | Per page | Sonnet | after the owner's review |
| 4 | Stitch upload of approved screens | Section 7 | Haiku | waits for the owner's go |


<a id="3-how-it-works"></a>

## 3. How it works

The owner's rule for frontend work (full text in [`AGENTS.md`](../AGENTS.md), "Design before frontend code"):

1. **Design** the screens as HTML from the real design system in `design/<feature>/`, responsive at 1440, 768 and 390, with no sideways scrolling.
2. **Review:** open them in a visible Playwright browser as one sheet (each screen at the three widths side by side).
3. **Decide:** the owner approves or rejects. Rejected: design the next version. Nothing goes to Stitch before approval.
4. **Approved:** mark the row, delete the versions that were not approved, and upload to Stitch only when the owner says so.
5. **Code** it in `apps/web` only when the owner says so. Mark the row ![coding][coding].
6. **Review the built page:** the owner opens the running page and asks for changes (![changes asked][changes]) or approves it. Changes are made and reviewed again until the owner approves.
7. **Build approved:** mark the row ![build approved][coded]. Only then is the page done.

<details>
<summary>How to read the tables</summary>

- **ID** is the screen's permanent name. A new state gets a letter (S18a, S18b); a new design gets a version (v2, v3).
- **Design** links open the HTML on VS Code Live Server with the repo root as its root (`http://127.0.0.1:5500/`): right-click the repo, "Open with Live Server", then click. Resize the browser to check 1440, 768 and 390.
- **As built** links the screen as the app looks today (`design/current-app/screens/`). "New" means `apps/web` has no such screen.
- **Status:** ![approved][approved] can be coded, ![in review][review] waiting for the owner, ![rejected][rejected] replaced or redesigned.
- **Stitch:** ✓ on the canvas of project `330652592731776730`; **–** not uploaded; **missing** was uploaded but is no longer on the canvas.
- **Code:** ![not coded][notcoded] not built yet; ![coding][coding] being built; ![build in review][builtreview] built and waiting for the owner to review the running page; ![changes asked][changes] the owner asked for changes; ![build approved][coded] the owner approved the built page.

</details>

<a id="4-screens"></a>

## 4. Screens

Link bases: designs in `design/web-v2/`, observability in `design/observability/`.

<a id="41-onboarding"></a>

### 4.1 Onboarding

Website, scan, brand kit, connect accounts (optional), questionnaire, research. Route `/onboarding`.

| ID   | Screen                              | Design                                                                                                                                                                                                                            | As built                                                                            | Status                   | Stitch | Code                   | Notes                                          |
| ---- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------ | ------ | ---------------------- | ---------------------------------------------- |
| S01  | Website step                        | [empty](http://127.0.0.1:5500/design/web-v2/screens-s01/s01-v3-empty.html), [typed](http://127.0.0.1:5500/design/web-v2/screens-s01/s01-v3-typed.html), [invalid](http://127.0.0.1:5500/design/web-v2/screens-s01/s01-v3-error.html) | [open](http://127.0.0.1:5500/design/current-app/screens/01-onboarding.html)          | ![approved][approved] v3 | ✓     | ![not coded][notcoded] |                                                |
| S02  | Scanning                            | [running](http://127.0.0.1:5500/design/web-v2/screens-s02/s02-v4-running.html) (v4), [failed](http://127.0.0.1:5500/design/web-v2/screens-s02/s02-v3-failed.html) (v3)                                                              | [open](http://127.0.0.1:5500/design/current-app/screens/17-onboarding-scanning.html) | ![approved][approved] v4 | ✓     | ![not coded][notcoded] |                                                |
| S17a | Check your brand kit                | [open](http://127.0.0.1:5500/design/web-v2/screens-s17/s17a-brand-kit-review.html)                                                                                                                                                 | New                                                                                 | ![approved][approved] v1 | ✓     | ![coding][coding]      | Edit what the scan found; pick platforms       |
| S17b | Connect accounts                    | [open](http://127.0.0.1:5500/design/web-v2/screens-s17/s17b-connect-accounts.html)                                                                                                                                                 | New                                                                                 | ![approved][approved] v1 | ✓     | ![coding][coding]      | Optional; "Skip, connect later"                |
| S17c | Instagram connected                 | [open](http://127.0.0.1:5500/design/web-v2/screens-s17/s17c-connect-accounts-connected.html)                                                                                                                                       | New                                                                                 | ![approved][approved] v1 | ✓     | ![coding][coding]      | Desktop and phone only                         |
| S18a | Questionnaire: start, pick language | [open](http://127.0.0.1:5500/design/web-v2/screens-s18/s18a-start.html)                                                                                                                                                            | New                                                                                 | ![approved][approved] v2 | ✓     | ![coding][coding]      |                                                |
| S18b | Questionnaire: confirm the website  | [open](http://127.0.0.1:5500/design/web-v2/screens-s18/s18b-confirm.html)                                                                                                                                                          | New                                                                                 | ![approved][approved] v3 | ✓     | ![coding][coding]      | Text box only after "Not quite, let me fix it" |
| S18c | Questionnaire: something else       | [open](http://127.0.0.1:5500/design/web-v2/screens-s18/s18c-something-else.html)                                                                                                                                                   | New                                                                                 | ![approved][approved] v3 | ✓     | ![coding][coding]      | "Something else" opens the text box            |
| S18d | Questionnaire: follow-up            | [open](http://127.0.0.1:5500/design/web-v2/screens-s18/s18d-follow-up.html)                                                                                                                                                        | New                                                                                 | ![approved][approved] v3 | ✓     | ![coding][coding]      |                                                |
| S18e | Questionnaire: summary              | [open](http://127.0.0.1:5500/design/web-v2/screens-s18/s18e-summary.html)                                                                                                                                                          | New                                                                                 | ![approved][approved] v2 | ✓     | ![coding][coding]      | Approval starts research                       |
| S18f | Questionnaire: change an answer     | [open](http://127.0.0.1:5500/design/web-v2/screens-s18/s18f-edit-answer.html)                                                                                                                                                      | New                                                                                 | ![approved][approved] v1 | ✓     | ![coding][coding]      | Bottom sheet on phone                          |
| S19a | Research running                    | [open](http://127.0.0.1:5500/design/web-v2/screens-s19/s19a-research-running.html)                                                                                                                                                 | New                                                                                 | ![approved][approved] v1 | ✓     | ![coding][coding]      | Steps: gather, diagnose, profile, save         |
| S19b | Research done                       | [open](http://127.0.0.1:5500/design/web-v2/screens-s19/s19b-research-done.html)                                                                                                                                                    | New                                                                                 | ![approved][approved] v1 | ✓     | ![coding][coding]      | "See your first month"                         |
| S19c | Research stopped                    | [open](http://127.0.0.1:5500/design/web-v2/screens-s19/s19c-research-failed.html)                                                                                                                                                  | New                                                                                 | ![approved][approved] v1 | ✓     | ![coding][coding]      | Answers are saved; try again resumes           |

<a id="42-strategy-and-research"></a>

### 4.2 Strategy and research

Route `/c/:brandId/strategy`. S20 replaces the old S05 design of this page.

| ID   | Screen                            | Design                                                                            | As built                                                                 | Status                   | Stitch  | Code              | Notes                                            |
| ---- | --------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------ | ------- | ----------------- | ------------------------------------------------ |
| S20a | Strategy draft, 30-minute window  | [open](http://127.0.0.1:5500/design/web-v2/screens-s20/s20a-strategy-draft.html)   | [open](http://127.0.0.1:5500/design/current-app/screens/05-strategy.html) | ![approved][approved] v1 | missing | ![coding][coding] | Countdown ring; "Start now" or "Ask for changes" |
| S20b | Ask for changes                   | [open](http://127.0.0.1:5500/design/web-v2/screens-s20/s20b-ask-for-changes.html)  | [open](http://127.0.0.1:5500/design/current-app/screens/05-strategy.html) | ![approved][approved] v1 | missing | ![coding][coding] | A redraft starts a fresh 30 minutes              |
| S20c | Started on its own                | [open](http://127.0.0.1:5500/design/web-v2/screens-s20/s20c-strategy-started.html) | [open](http://127.0.0.1:5500/design/current-app/screens/05-strategy.html) | ![approved][approved] v1 | missing | ![coding][coding] | When`approved_by` is null after 30 minutes     |
| S21a | Research (`/strategy/research`) | [open](http://127.0.0.1:5500/design/web-v2/screens-s21/s21a-research.html)         | New                                                                      | ![approved][approved] v1 | missing | ![coding][coding] | Sources, version, "Run research again"           |
| S21b | Research running again            | [open](http://127.0.0.1:5500/design/web-v2/screens-s21/s21b-research-again.html)   | New                                                                      | ![approved][approved] v1 | missing | ![coding][coding] | Current version stays readable                   |

<a id="43-brand-workspace"></a>

### 4.3 Brand workspace

Route prefix `/c/:brandId`. Every screen is designed at 1440, 768 and 390.

| ID  | Screen                    | Design                                                                                                                                                                                                                                                                                                                                                                                                                                                               | As built                                                                                     | Status                   | Stitch     | Code              | Notes                                                 |
| --- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------ | ---------- | ----------------- | ----------------------------------------------------- |
| S03 | Overview                  | [open](http://127.0.0.1:5500/design/web-v2/screens-s03/s03-v3-overview.html)                                                                                                                                                                                                                                                                                                                                                                                          | [open](http://127.0.0.1:5500/design/current-app/screens/02-overview.html)                     | ![approved][approved] v3 | phone only | ![coding][coding] | "This week" with platform and format; "Open calendar" |
| S04 | Overview with agent chat  | [open](http://127.0.0.1:5500/design/web-v2/screens-s04/s04-v3-overview-agent-chat.html)                                                                                                                                                                                                                                                                                                                                                                               | [open](http://127.0.0.1:5500/design/current-app/screens/03-overview-agent-chat.html)          | ![approved][approved] v3 | ✓         | ![coding][coding] | Full-screen chat on phone                             |
| S06 | Content                   | [open](http://127.0.0.1:5500/design/web-v2/screens-s06/s06-v3-content.html)                                                                                                                                                                                                                                                                                                                                                                                           | [open](http://127.0.0.1:5500/design/current-app/screens/06-content.html)                      | ![approved][approved] v3 | –         | ![coding][coding] | "Where it goes" column; Review button in the row      |
| S07 | Content, needs approval   | [open](http://127.0.0.1:5500/design/web-v2/screens-s07/s07-v3-needs-approval.html)                                                                                                                                                                                                                                                                                                                                                                                    | [open](http://127.0.0.1:5500/design/current-app/screens/07-content-needs-approval.html)       | ![approved][approved] v3 | –         | ![coding][coding] | "Review one by one"                                   |
| S08 | Review post               | [open](http://127.0.0.1:5500/design/web-v2/screens-s08/s08-v3-review-post.html)                                                                                                                                                                                                                                                                                                                                                                                       | [open](http://127.0.0.1:5500/design/current-app/screens/08-content-post-panel.html)           | ![approved][approved] v3 | –         | ![coding][coding] | The one review panel; date and time editable          |
| S09 | Approvals                 | [idle](http://127.0.0.1:5500/design/web-v2/screens-s09/s09a-approvals.html), [swipe right](http://127.0.0.1:5500/design/web-v2/screens-s09/s09b-swipe-right-approve.html), [swipe left](http://127.0.0.1:5500/design/web-v2/screens-s09/s09c-swipe-left-reject.html), [undo](http://127.0.0.1:5500/design/web-v2/screens-s09/s09d-undo-after-reject.html)                                                                                                                | [open](http://127.0.0.1:5500/design/current-app/screens/09-approvals.html)                    | ![approved][approved] v3 | –         | ![coding][coding] | Swipe stack kept from the built app                   |
| S10 | Full screen viewer        | [carousel](http://127.0.0.1:5500/design/web-v2/screens-s10/s10-v3-carousel.html), [reel](http://127.0.0.1:5500/design/web-v2/screens-s10/s10-v3-reel.html), [phone swipe](http://127.0.0.1:5500/design/web-v2/screens-s10/s10-v3-phone-swipe.html), [after approve](http://127.0.0.1:5500/design/web-v2/screens-s10/s10-v3-after-approve.html)                                                                                                                           | [open](http://127.0.0.1:5500/design/current-app/screens/10-approvals-image-full-size.html)    | ![approved][approved] v3 | –         | ![coding][coding] | Decide without closing                                |
| S11 | Calendar                  | [month](http://127.0.0.1:5500/design/web-v2/screens-s11/s11-v3-month.html), [drag](http://127.0.0.1:5500/design/web-v2/screens-s11/s11-v3-drag.html), [moved](http://127.0.0.1:5500/design/web-v2/screens-s11/s11-v3-moved.html), [day](http://127.0.0.1:5500/design/web-v2/screens-s11/s11-v3-day.html), [post](http://127.0.0.1:5500/design/web-v2/screens-s11/s11-v3-post.html), [phone month](http://127.0.0.1:5500/design/web-v2/screens-s11/s11-v3-phone-month.html) | [open](http://127.0.0.1:5500/design/current-app/screens/11-calendar.html)                     | ![approved][approved] v3 | –         | ![coding][coding] | Coloured platform labels; compact phone agenda        |
| S12 | Analytics                 | [empty](http://127.0.0.1:5500/design/web-v2/screens-s12/s12-v3-empty.html), [first week](http://127.0.0.1:5500/design/web-v2/screens-s12/s12-v3-first-week.html), [a month](http://127.0.0.1:5500/design/web-v2/screens-s12/s12-v3-month.html)                                                                                                                                                                                                                          | [open](http://127.0.0.1:5500/design/current-app/screens/12-analytics-empty.html)              | ![approved][approved] v3 | –         | ![coding][coding] | Every number judged in plain words                    |
| S13 | Settings, brand kit       | [view](http://127.0.0.1:5500/design/web-v2/screens-s13/s13-v3-brand-kit.html), [editing](http://127.0.0.1:5500/design/web-v2/screens-s13/s13-v3-brand-kit-editing.html)                                                                                                                                                                                                                                                                                                | [open](http://127.0.0.1:5500/design/current-app/screens/13-settings-brand-kit.html)           | ![approved][approved] v3 | –         | ![coding][coding] | Same cards as S17a                                    |
| S14 | Settings, social accounts | [accounts](http://127.0.0.1:5500/design/web-v2/screens-s14/s14-v3-accounts.html), [none connected](http://127.0.0.1:5500/design/web-v2/screens-s14/s14-v3-accounts-none-connected.html), [connect failed](http://127.0.0.1:5500/design/web-v2/screens-s14/s14-v3-accounts-connect-failed.html)                                                                                                                                                                          | [open](http://127.0.0.1:5500/design/current-app/screens/14-settings-social-accounts.html)     | ![approved][approved] v3 | –         | ![coding][coding] | Expiry, reconnect, posts waiting                      |
| S15 | Settings, preferences     | [preferences](http://127.0.0.1:5500/design/web-v2/screens-s15/s15-v3-preferences.html), [saved](http://127.0.0.1:5500/design/web-v2/screens-s15/s15-v3-preferences-saved.html)                                                                                                                                                                                                                                                                                         | [open](http://127.0.0.1:5500/design/current-app/screens/15-settings-preferences.html)         | ![approved][approved] v3 | –         | ![coding][coding] | Approval and 30-minute start always on                |
| S16 | Settings, delete          | [typing](http://127.0.0.1:5500/design/web-v2/screens-s16/s16-v3-delete-typing.html), [ready](http://127.0.0.1:5500/design/web-v2/screens-s16/s16-v3-delete-ready.html), [archived](http://127.0.0.1:5500/design/web-v2/screens-s16/s16-v3-archived.html)                                                                                                                                                                                                                | [open](http://127.0.0.1:5500/design/current-app/screens/16-settings-delete-confirmation.html) | ![approved][approved] v3 | –         | ![coding][coding] | Archive instead; type the name to delete              |

<a id="44-header"></a>

### 4.4 Header

Every page. Approved 2026-09-26. Builder: `design/web-v2/header_design.py`.

| ID  | States                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | As built                                                                 | Status                   | Stitch | Code              | Notes                                             |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------ | ------ | ----------------- | ------------------------------------------------- |
| HDR | [client](http://127.0.0.1:5500/design/web-v2/screens-hdr/hdr-v1-client.html), [brand switcher](http://127.0.0.1:5500/design/web-v2/screens-hdr/hdr-v1-client-switcher-open.html), [account menu](http://127.0.0.1:5500/design/web-v2/screens-hdr/hdr-v1-client-account-open.html), [dark](http://127.0.0.1:5500/design/web-v2/screens-hdr/hdr-v1-client-dark.html), [admin area](http://127.0.0.1:5500/design/web-v2/screens-hdr/hdr-v1-admin-area.html), [admin menu](http://127.0.0.1:5500/design/web-v2/screens-hdr/hdr-v1-admin-area-account-open.html), [admin in a brand](http://127.0.0.1:5500/design/web-v2/screens-hdr/hdr-v1-admin-in-client.html), [switch client](http://127.0.0.1:5500/design/web-v2/screens-hdr/hdr-v1-admin-in-client-switcher-open.html), [onboarding](http://127.0.0.1:5500/design/web-v2/screens-hdr/hdr-v1-onboarding-first.html), [adding a brand](http://127.0.0.1:5500/design/web-v2/screens-hdr/hdr-v1-onboarding-add-brand.html) | [open](http://127.0.0.1:5500/design/current-app/screens/02-overview.html) | ![approved][approved] v1 | –     | ![coding][coding] | Theme in the account menu; bottom sheets on phone |

<a id="45-auth"></a>

### 4.5 Auth

Our own auth, replacing Clerk later. Approved 2026-09-26. As built: Clerk default, not captured. Builder: `design/web-v2/auth_screens.py`.

| ID     | Screen                                               | States                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Route                                     | Status                   | Code              | Notes                                                                |
| ------ | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------ | ----------------- | -------------------------------------------------------------------- |
| AUTH-1 | Sign in                                              | [default](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-sign-in.html), [wrong password](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-sign-in-wrong-password.html), [loading](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-sign-in-loading.html), [session ended](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-sign-in-session-ended.html)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `/sign-in`                              | ![approved][approved] v1 | ![coding][coding] | Never says which field is wrong                                      |
| AUTH-2 | Sign up                                              | [default](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-sign-up.html), [email used](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-sign-up-email-used.html), [weak password](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-sign-up-weak-password.html)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `/sign-up`                              | ![approved][approved] v1 | ![coding][coding] | Live password rules                                                  |
| AUTH-3 | Email code                                           | [default](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-verify-email.html), [wrong code](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-verify-email-wrong-code.html), [expired](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-verify-email-expired.html), [new code sent](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-verify-email-new-code-sent.html)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `/verify`                               | ![approved][approved] v1 | ![coding][coding] | Paste and autofill work                                              |
| AUTH-4 | Forgot and reset password                            | [forgot](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-forgot-password.html), [check email](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-check-email.html), [reset](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-reset-password.html), [changed](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-password-changed.html), [link expired](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-reset-link-expired.html)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `/forgot-password`, `/reset-password` | ![approved][approved] v1 | ![coding][coding] | Never reveals if an email has an account                             |
| AUTH-5 | Accept an invite                                     | [default](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-invite-accept.html), [loading](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-invite-accept-loading.html), [already used](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-invite-used.html), [expired](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-invite-expired.html)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `/invite/:token`                        | ![approved][approved] v1 | ![coding][coding] | No code step; the link proves the email                              |
| AUTH-6 | Too many attempts                                    | [open](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-too-many-attempts.html)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `/sign-in`                              | ![approved][approved] v1 | ![coding][coding] | Countdown; reset still works                                         |
| AUTH-7 | Two-factor sign-in (admin required, client optional) | [setup](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-setup-choose.html), [app](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-setup-app.html), [app wrong code](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-setup-app-wrong-code.html), [passkey](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-setup-passkey.html), [passkey cancelled](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-setup-passkey-cancelled.html), [backup codes](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-setup-backup-codes.html), [sign in code](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-sign-in-code.html), [wrong code](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-sign-in-code-wrong.html), [sign in passkey](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-sign-in-passkey.html), [backup code](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-sign-in-backup-code.html), [codes low](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-sign-in-backup-codes-low.html), [paused](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-sign-in-paused.html), [lost access](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-lost-access.html), [request sent](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-lost-access-sent.html), [manage](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-manage.html), [last method](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-manage-last-method.html), [remove passkey](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-manage-remove-passkey.html), [new codes confirm](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-manage-new-codes-confirm.html), [new codes](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-manage-new-codes.html) | `/sign-in`, admin account               | ![approved][approved] v1 | ![coding][coding] | Passkey recommended; backup codes shown once; no email-only recovery |

<a id="46-admin"></a>

### 4.6 Admin

The agency owner's area. Approved 2026-09-26. Builder: `design/web-v2/admin_screens.py`. All new; nothing built.

| ID    | Screen                   | States                                                                                                                                                                                                                                                                    | Route                  | Status                   | Code              | Notes                                                           |
| ----- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------ | ----------------- | --------------------------------------------------------------- |
| ADM-1 | Clients (admin home)     | [open](http://127.0.0.1:5500/design/web-v2/screens-admin/adm-v1-clients.html)                                                                                                                                                                                              | `/admin/clients`     | ![approved][approved] v1 | ![coding][coding] | Attention tiles; "needs you" first                              |
| ADM-2 | Clients, empty and error | [empty](http://127.0.0.1:5500/design/web-v2/screens-admin/adm-v1-clients-empty.html), [error](http://127.0.0.1:5500/design/web-v2/screens-admin/adm-v1-clients-error.html)                                                                                                  | `/admin/clients`     | ![approved][approved] v1 | ![coding][coding] |                                                                 |
| ADM-3 | Invite a client          | [dialog](http://127.0.0.1:5500/design/web-v2/screens-admin/adm-v1-invite.html), [email in use](http://127.0.0.1:5500/design/web-v2/screens-admin/adm-v1-invite-email-in-use.html), [sent](http://127.0.0.1:5500/design/web-v2/screens-admin/adm-v1-invite-sent.html)         | `/admin/clients`     | ![approved][approved] v1 | ![coding][coding] |                                                                 |
| ADM-4 | Client detail            | [active](http://127.0.0.1:5500/design/web-v2/screens-admin/adm-v1-client-detail.html), [invited](http://127.0.0.1:5500/design/web-v2/screens-admin/adm-v1-client-invited.html), [cancel invite](http://127.0.0.1:5500/design/web-v2/screens-admin/adm-v1-cancel-invite.html) | `/admin/clients/:id` | ![approved][approved] v1 | ![coding][coding] | Brand cards with loop stage                                     |
| ADM-5 | Add a brand for a client | [dialog](http://127.0.0.1:5500/design/web-v2/screens-admin/adm-v1-add-brand.html), [scan running](http://127.0.0.1:5500/design/web-v2/screens-admin/adm-v1-add-brand-reading.html)                                                                                          | `/admin/clients/:id` | ![approved][approved] v1 | ![coding][coding] | Changed 2026-09-28 (owner): the admin adds a brand through the same onboarding flow as a client (S01 to S19 under the admin header, `/onboarding?for=<client>`); the admin can skip connecting or send the client a link, and questionnaire answers are marked "Answered by the agency" |
| ADM-6 | Viewing a brand as admin | [open](http://127.0.0.1:5500/design/web-v2/screens-admin/adm-v1-viewing-as-admin.html)                                                                                                                                                                                     | `/c/:brandId`        | ![approved][approved] v1 | ![coding][coding] | Code with the header breadcrumb, not the dark strip (section 5) |
| ADM-7 | Admin settings | v1: [team](http://127.0.0.1:5500/design/web-v2/screens-admin-settings/adm7-v1-team.html), [invite a teammate](http://127.0.0.1:5500/design/web-v2/screens-admin-settings/adm7-v1-team-invite.html), [notifications](http://127.0.0.1:5500/design/web-v2/screens-admin-settings/adm7-v1-notifications.html); [one-look review](http://127.0.0.1:5500/design/web-v2/review-admin-settings.html) | `/admin/settings` | ![in review][review] v1 | ![not coded][notcoded] | Built 2026-09-28. Scope: **Team** (other admins, invite/remove) and **Notifications** (agency-wide email alerts) only. Personal profile, password and two-factor stay in "Your account" (account menu) — not repeated here. Third rail item "Settings" added beside Clients/Observability. Checked responsive at 1440/768/390, no sideways scroll. Awaiting owner review |

<a id="47-observability"></a>

### 4.7 Observability

Admin only, routes planned under `/admin`. v2 builder: `design/observability/build.py`; v3 builder: `design/observability/obs_v3.py`.

| ID    | Screen                | v2 (approved)                                                             | v3                                                                                    | Status                   | Stitch | Code              | Notes                                    |
| ----- | --------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------ | ------ | ----------------- | ---------------------------------------- |
| OBS-1 | Overview              | [open](http://127.0.0.1:5500/design/observability/screens/overview.html)   | [open](http://127.0.0.1:5500/design/observability/screens-v3/obs-v3-overview.html)     | ![approved][approved] v3 | ✓ v2  | ![coding][coding] | v3 adds one frontend number              |
| OBS-2 | Agents                | [open](http://127.0.0.1:5500/design/observability/screens/agents.html)     | –                                                                                    | ![approved][approved] v2 | ✓     | ![coding][coding] |                                          |
| OBS-3 | Agent run detail      | [open](http://127.0.0.1:5500/design/observability/screens/run-detail.html) | –                                                                                    | ![approved][approved] v2 | ✓     | ![coding][coding] |                                          |
| OBS-4 | Server                | [open](http://127.0.0.1:5500/design/observability/screens/server.html)     | [open](http://127.0.0.1:5500/design/observability/screens-v3/obs-v3-server.html)       | ![approved][approved] v3 | ✓ v2  | ![coding][coding] | v3 is backend only                       |
| OBS-5 | Frontend              | –                                                                        | [open](http://127.0.0.1:5500/design/observability/screens-v3/obs-v3-frontend.html)     | ![approved][approved] v1 | –     | ![coding][coding] | Errors, failed actions, failed API calls |
| OBS-6 | Frontend error detail | –                                                                        | [open](http://127.0.0.1:5500/design/observability/screens-v3/obs-v3-error-detail.html) | ![approved][approved] v1 | –     | ![coding][coding] | What the person did; where in our code   |

<a id="48-brands-and-account"></a>

### 4.8 Your brands and account

Builder: `design/web-v2/brands_account.py`.

| ID   | Screen       | States                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Route        | Status                  | Code                   | Notes                                                            |
| ---- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------------------- | ---------------------- | ---------------------------------------------------------------- |
| BA-1 | Your brands  | [brands](http://127.0.0.1:5500/design/web-v2/screens-brands-account/ba-v1-brands.html), [one setting up](http://127.0.0.1:5500/design/web-v2/screens-brands-account/ba-v1-brands-setting-up.html)                                                                                                                                                                                                                                                                                                                                 | `/`        | ![approved][approved] v1 | ![not coded][notcoded] | Brand cards with loop stage and what needs you; "Continue setup" |
| BA-2 | Your account | [2FA off](http://127.0.0.1:5500/design/web-v2/screens-brands-account/ba-v1-account.html), [2FA on](http://127.0.0.1:5500/design/web-v2/screens-brands-account/ba-v1-account-2fa-on.html), [edit details](http://127.0.0.1:5500/design/web-v2/screens-brands-account/ba-v1-account-edit-details.html), [sign out devices](http://127.0.0.1:5500/design/web-v2/screens-brands-account/ba-v1-account-sign-out-devices.html), [turn off 2FA](http://127.0.0.1:5500/design/web-v2/screens-brands-account/ba-v1-account-2fa-turn-off.html) | `/account` | ![approved][approved] v1 | ![not coded][notcoded] | Two-factor reuses AUTH-7 with client rules                       |

<a id="49-system-states"></a>

### 4.9 System states

Builder: `design/web-v2/system_states.py`. The mocks use the old top bar; code uses the approved header.

| ID   | Screen                     | States                                                                                                                                                                                                                                                                                                | Route                               | Status                  | Code                   | Notes                                                         |
| ---- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------- | ---------------------- | ------------------------------------------------------------- |
| ST-1 | Error page                 | [app](http://127.0.0.1:5500/design/web-v2/screens-states/st-v1-error-app.html), [workspace](http://127.0.0.1:5500/design/web-v2/screens-states/st-v1-error-workspace.html), [global](http://127.0.0.1:5500/design/web-v2/screens-states/st-v1-error-global.html)                                         | `error.tsx`, `global-error.tsx` | ![approved][approved] v1 | ![not coded][notcoded] | Support reference with Copy; never the raw error              |
| ST-2 | Not found                  | [page](http://127.0.0.1:5500/design/web-v2/screens-states/st-v1-404-page.html), [brand](http://127.0.0.1:5500/design/web-v2/screens-states/st-v1-404-brand.html)                                                                                                                                        | `not-found.tsx`                   | ![approved][approved] v1 | ![not coded][notcoded] | Brand 404 never says missing, archived or not yours           |
| ST-3 | Loading                    | [overview](http://127.0.0.1:5500/design/web-v2/screens-states/st-v1-loading-overview.html), [content](http://127.0.0.1:5500/design/web-v2/screens-states/st-v1-loading-content.html), [approvals](http://127.0.0.1:5500/design/web-v2/screens-states/st-v1-loading-approvals.html)                       | `loading.tsx`                     | ![approved][approved] v1 | ![not coded][notcoded] | Labels show at once; one slow pulse; still for reduced motion |
| ST-4 | Approvals empty            | [all done](http://127.0.0.1:5500/design/web-v2/screens-states/st-v1-approvals-done.html), [nothing yet](http://127.0.0.1:5500/design/web-v2/screens-states/st-v1-approvals-none.html)                                                                                                                   | `/c/:brandId/approvals`           | ![approved][approved] v1 | ![not coded][notcoded] | What happens next                                             |
| ST-5 | Content and calendar empty | [strategy not started](http://127.0.0.1:5500/design/web-v2/screens-states/st-v1-content-empty-strategy.html), [drafting](http://127.0.0.1:5500/design/web-v2/screens-states/st-v1-content-empty-drafting.html), [calendar](http://127.0.0.1:5500/design/web-v2/screens-states/st-v1-calendar-empty.html) | `/content`, `/calendar`         | ![approved][approved] v1 | ![not coded][notcoded] | Calendar still shows free best times                          |

<a id="410-missing-flows"></a>

### 4.10 Missing flows

Builder: `design/web-v2/flows_extra.py`.

| ID   | Screen                         | States                                                                                                                                                                                                                                                                                                        | Route                         | Status                  | Code                   | Notes                                                                          |
| ---- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ----------------------- | ---------------------- | ------------------------------------------------------------------------------ |
| FL-1 | Fill in the brand kit yourself | [form](http://127.0.0.1:5500/design/web-v2/screens-flows/fl-v1-kit-manual.html)                                                                                                                                                                                                                                | `/onboarding`               | ![approved][approved] v1 | ![not coded][notcoded] | Guided form; Continue needs name, what you do, who it's for, one platform      |
| FL-2 | Post didn't go out             | [slide too tall](http://127.0.0.1:5500/design/web-v2/screens-flows/fl-v1-post-failed-size.html), [connection expired](http://127.0.0.1:5500/design/web-v2/screens-flows/fl-v1-post-failed-connection.html), [on the overview](http://127.0.0.1:5500/design/web-v2/screens-flows/fl-v1-post-failed-overview.html) | `/content`, `/c/:brandId` | ![approved][approved] v1 | ![not coded][notcoded] | "Change and try again" or "Reconnect and try again"; failed rows pinned on top |
| FL-3 | Published post                 | [panel](http://127.0.0.1:5500/design/web-v2/screens-flows/fl-v1-post-published.html)                                                                                                                                                                                                                           | `/content`                  | ![approved][approved] v1 | ![not coded][notcoded] | Link to the live post; results after a day; not editable                       |
| FL-4 | Agent drafting posts           | [drafting](http://127.0.0.1:5500/design/web-v2/screens-flows/fl-v1-post-drafting.html), [drafts arrived](http://127.0.0.1:5500/design/web-v2/screens-flows/fl-v1-post-drafts-arrived.html)                                                                                                                      | `/content`                  | ![approved][approved] v1 | ![not coded][notcoded] | "2 of 6 ready"; placeholders show platform, format and time                    |
| FL-5 | Strategy version 2             | [page](http://127.0.0.1:5500/design/web-v2/screens-flows/fl-v1-strategy-v2.html)                                                                                                                                                                                                                               | `/c/:brandId/strategy`      | ![approved][approved] v1 | ![not coded][notcoded] | What changed and why; before and after; learnings that caused it               |

<a id="411-emails"></a>

### 4.11 Emails

Builder: `design/emails/build.py`. Email-safe HTML: tables, inline styles, 600px wide, works at 390.

| ID | Email | Design | Route | Status | Code | Notes |
|---|---|---|---|---|---|---|
| EM-1 | Invite a client | [email](http://127.0.0.1:5500/design/emails/out/em-v1-invite.html) | Email | ![approved][approved] v1 | ![not coded][notcoded] | Sent by the admin; invite lasts 7 days |
| EM-2 | Sign-in code | [email](http://127.0.0.1:5500/design/emails/out/em-v1-sign-in-code.html) | Email | ![approved][approved] v1 | ![not coded][notcoded] | 6 digits, 10 minutes |
| EM-3 | Password reset | [email](http://127.0.0.1:5500/design/emails/out/em-v1-password-reset.html) | Email | ![approved][approved] v1 | ![not coded][notcoded] | Link lasts 30 minutes; never says whether the account exists |
| EM-4 | Password changed | [email](http://127.0.0.1:5500/design/emails/out/em-v1-password-changed.html) | Email | ![approved][approved] v1 | ![not coded][notcoded] | Security notice with a way to get help |
| EM-5 | Posts waiting for approval | [email](http://127.0.0.1:5500/design/emails/out/em-v1-approvals-waiting.html) | Email | ![approved][approved] v1 | ![not coded][notcoded] | Count, first post's platform, format and time, one button |
| EM-6 | New posts ready to review | [email](http://127.0.0.1:5500/design/emails/out/em-v1-posts-ready.html) | Email | ![approved][approved] v1 | ![not coded][notcoded] | Sent when a new batch is drafted: count, date range, one button |
| EM-7 | Post didn't go out | [email](http://127.0.0.1:5500/design/emails/out/em-v1-post-failed.html) | Email | ![approved][approved] v1 | ![not coded][notcoded] | Network, reason, fix button |
| EM-8 | Connection expired | [email](http://127.0.0.1:5500/design/emails/out/em-v1-connection-expired.html) | Email | ![approved][approved] v1 | ![not coded][notcoded] | Approved posts wait until reconnected |

<a id="412-dark-mode-check"></a>

### 4.12 Dark mode check

Builder: `design/dark-check/build.py`. A report, not new screens: approved screens rendered dark, with proposed fixes in `design/dark-check/dark-overrides.css`. Report: `design/dark-check/REPORT.md` (5 problems, 3 questions for the owner).

| ID | Screen | Design | Route | Status | Code | Notes |
|---|---|---|---|---|---|---|
| DK-1 | Dark mode on approved screens | S03 [before](http://127.0.0.1:5500/design/dark-check/screens/s03-overview-dark.html) and [fixed](http://127.0.0.1:5500/design/dark-check/screens/s03-overview-dark-fixed.html), S06 [before](http://127.0.0.1:5500/design/dark-check/screens/s06-content-dark.html) and [fixed](http://127.0.0.1:5500/design/dark-check/screens/s06-content-dark-fixed.html), S08 [before](http://127.0.0.1:5500/design/dark-check/screens/s08-review-post-dark.html) and [fixed](http://127.0.0.1:5500/design/dark-check/screens/s08-review-post-dark-fixed.html), S09 [before](http://127.0.0.1:5500/design/dark-check/screens/s09-approvals-dark.html) and [fixed](http://127.0.0.1:5500/design/dark-check/screens/s09-approvals-dark-fixed.html), S11 [before](http://127.0.0.1:5500/design/dark-check/screens/s11-calendar-month-dark.html) and [fixed](http://127.0.0.1:5500/design/dark-check/screens/s11-calendar-month-dark-fixed.html), S12 [before](http://127.0.0.1:5500/design/dark-check/screens/s12-analytics-month-dark.html) and [fixed](http://127.0.0.1:5500/design/dark-check/screens/s12-analytics-month-dark-fixed.html), S13 [before](http://127.0.0.1:5500/design/dark-check/screens/s13-brand-kit-dark.html) and [fixed](http://127.0.0.1:5500/design/dark-check/screens/s13-brand-kit-dark-fixed.html), AUTH [before](http://127.0.0.1:5500/design/dark-check/screens/auth-sign-in-dark.html) and [fixed](http://127.0.0.1:5500/design/dark-check/screens/auth-sign-in-dark-fixed.html), ADM-1 [before](http://127.0.0.1:5500/design/dark-check/screens/adm-clients-dark.html) and [fixed](http://127.0.0.1:5500/design/dark-check/screens/adm-clients-dark-fixed.html) | All | ![approved][approved] v1 | ![not coded][notcoded] | Fixes become real CSS in `packages/ui` once approved |

<a id="5-rules-to-carry-into-code"></a>

## 5. Rules to carry into code

Behaviour the owner decided in review, which a static design cannot show.

**Everywhere**

- **Platform and format:** every post shows its platform named in its own colour (Instagram pink, Facebook blue, LinkedIn blue, TikTok black) and its format: image post, carousel, reel or story (`postFormatSchema`), for example "Instagram carousel, 5 slides". Never only a small icon.
- **Tablet and phone:** the side rail becomes a bottom tab bar (Overview, Strategy, Content, Approvals, More).
- **Not connected:** approving is allowed without a connected account. The post waits as "Approved, waiting for Instagram" and a banner nudges to connect. No error, no block.

**Onboarding**

- **Step bar:** shows on every onboarding screen at every size; on phone only the current step keeps its label.
- **S18 typing chips:** open questions show the text box at once. On choice, confirm and range questions the box appears only after a typing chip ("Something else", "Not quite, let me fix it"); that tap focuses the box and opens the keyboard.
- **S18f:** editing an earlier answer never resets later ones; the account manager reconciles in its follow-up.

**Strategy**

- **S20:** "Start now" sets `approved_by`. Doing nothing activates the strategy after 30 minutes with `approved_by` null, and S20c says it started on its own. Starting never publishes. "Ask for changes" writes the next version, which gets its own 30 minutes.
- **Overview header (S03, S04):** the button is "Ask for changes" (opens S20b), not "Rewrite strategy".

**Posts and approvals**

- **S03 This week:** tapping a card opens that post in S08.
- **S06 Content:** soonest first; a Review button on posts that need approval; a platform filter.
- **S08 Review post:** every "Review" opens this one panel. "Approve, next post" opens the next waiting post. The owner can set any date and time; the day's best times are one tap; changing the time moves only that post.
- **S09 swipe (keep `SwipeCard` from `packages/ui`):** right approves, left rejects, with an Approve or Reject stamp while dragging; arrow keys do the same; E asks for changes; Space opens the full post; every decision has Undo. After a reject, the toast offers optional reasons that feed the agent's learnings.

**Header**

- **Theme** (light, dark, device) lives in the account menu, not in the bar.
- **Brand switcher:** each brand with its colour mark, name and website; the current one ticked; "2 to approve" chips; "All brands" and "Add a brand". A light brand colour gets a dark letter.
- **Admin inside a brand:** the bar reads "‹ Clients / Tartinebakery" with "Maya Chen's brand" under it and the Admin badge; on phone the way back is a chevron labelled "Back to all clients".
- **Onboarding:** logo and avatar only; a client adding a brand gets "‹ Back to" the last brand.
- **Phone:** menus open as bottom sheets with rows at least 52px tall; "Ask the agent" becomes a tinted icon below 560px; the approvals count lives in the tab bar, not the header.

**Admin**

- **Navigation:** the admin rail and the tab bar hold Clients and Observability only, until admin settings exist.
- **Inside a client's brand:** use the approved header breadcrumb ("‹ Clients / Tartinebakery") plus one line: "Posts you approve here are approved in your name". Not a separate dark strip.
- **Clients list:** clients who need the admin come first; the whole row is one click target; cards on phone.
- **Add a brand for a client:** the website is the only field; the scan runs on the brand's card; the admin then checks the brand kit (S17a in admin context).
- **A post the admin approves** shows "approved by The Scale Agency" to the client.

**Observability**

- **Tabs:** Overview, Agents, Server, Frontend. Server shows the backend only; Frontend shows what people hit.
- **Frontend errors** come from Sentry (errors and releases); SigNoz stays for the backend. Every deploy is tagged with time and commit.
- **Failed API calls** include Server Action failures, because that is what the person saw. No session replay for now.
- **Left out on purpose:** page speed, traffic, browsers and countries.

**Auth**

- **Security:** forgot password never reveals whether an email has an account; a wrong password never says which field is wrong; the lock counts per email whether or not the account exists.
- **Code input:** one real input (`autocomplete="one-time-code"`, `inputmode="numeric"`, 6 digits) under the six drawn boxes, so paste, autofill and screen readers work.
- **Passwords:** at least 10 characters, not common or leaked, not the email; no forced symbol rules; show and hide; `new-password` and `current-password` hints.
- **Reset:** "Sign me out on other devices" is a real checkbox, ticked by default (the mockup draws it with a span).
- **Invites:** the invite link proves the email, so there is no code step.
- **Admin two-factor (AUTH-7):** required before the admin area opens; passkey recommended, authenticator app as the other method; 10 backup codes shown once; the last method can never be removed; lost access goes through a support video call and 24 hours' notice, never email alone.
- **Clients reuse the AUTH-7 screens** (owner, 2026-09-26): no separate design. For a client, two-factor is optional (turned on from account settings, with "Not now"), can be turned off (the last method can be removed), the side panel says it keeps their brand safe instead of "Admin accounts open every client's brand", and lost access uses the same support path. The differences are copy and rules in code, not new screens.

<a id="6-backend-follow-ups"></a>

## 6. Backend follow-ups

| From      | Change                                                                                                                 | Where                                              |
| --------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| S18c      | Accept a free-text answer (`other:` prefix) on choice and range questions; code reads facts only from tapped options | `packages/agents/src/account-manager/answers.ts` |
| S21       | Research returns sources with a kind and a note, plus version history; a re-run keeps the current version readable     | Research endpoints                                 |
| S20b      | "Ask for changes" sends the owner's request to the Strategist and drafts the next version with a fresh 30 minutes      | Strategy endpoints (2B-2)                          |
| S09d      | Store an optional reject reason and pass it to the learning loop                                                       | Posts, learnings                                   |
| S16       | `DELETE /brands/:id` only archives. A real delete and a restore are missing                                          | Brands endpoints                                   |
| S12       | A "small shops like yours" benchmark per brand; per-post followers and reel watch time depend on the Instagram API     | Research, metrics                                  |
| S17b, S09 | The publisher holds approved posts whose account is not connected and sends them once connected                        | Publisher (not built)                              |
| ADM-1     | `GET /admin/clients` returns posts to approve, expired connections, failed runs and last activity per client         | Admin endpoints                                    |
| ADM-4     | Resend and cancel an invite                                                                                            | Admin endpoints                                    |
| AUTH-5    | "Ask for a new invite" notifies the admin                                                                              | Auth, admin                                        |
| OBS-5     | Frontend error collection (Sentry recommended) and a tag on every release                                              | Web app, deploy                                    |
| EM-1 to EM-8 | Send the eight emails from the approved templates (invite, codes, reset, approvals waiting, new posts ready, post failed, connection expired) | API, email provider |

<a id="7-stitch-to-do"></a>

## 7. Stitch to-do

Project `330652592731776730`. Nothing is uploaded without the owner's approval.

**Upload, once the owner says so**

- Approved but not uploaded: S06 to S16, HDR, AUTH-1 to AUTH-7, ADM-1 to ADM-6, OBS-1 v3, OBS-2 and OBS-3 v3, OBS-4 v3, OBS-5, OBS-6, BA-1, BA-2, ST-1 to ST-5, FL-1 to FL-5, EM-1 to EM-8.
- Missing from the canvas, upload again: S20a, S20b, S20c, S21a, S21b, and S03 v3 desktop and tablet.

**Delete by hand (the Stitch API cannot delete a screen)**

- Replaced versions: S01 v1 and v2, S02 v2 and v3 scanning, S05, and the "Redesign v2" set of S03, S04, S06 to S16.
- S18 v1 (the form) and S18 v2 b, c, d.

<a id="8-decided-questions"></a>

## 8. Decided questions

Questions on approved designs. The recommendation applies unless the owner says otherwise.

<details>
<summary>Show the 65 decisions</summary>

| From     | Question                                                                                                      | Decision                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| S10      | Viewer keys: ← → move slides; A, R, E decide (the Approvals stack uses ← → to decide)                     | Keep the split                                                                           |
| S10      | "Ask for changes" from a slide starts with "Slide 2: …"                                                      | Yes                                                                                      |
| S10      | Format label "Image post" or "Post"                                                                           | "Image post" everywhere                                                                  |
| S10      | Reels open paused or play muted                                                                               | Play muted, unless the device asks for reduced motion                                    |
| S11      | "Scheduled" or "Approved, waiting for Instagram" while not connected                                          | The honest label everywhere, S03 included                                                |
| S11      | A past month with published posts                                                                             | Not needed; S12 covers results                                                           |
| S11      | Tapping a free best time asks the agent to draft a post                                                       | Yes; the draft still needs approval                                                      |
| S12      | Compare with "small shops like yours"                                                                         | Keep; research stores a benchmark                                                        |
| S12      | Numbers the API may not give                                                                                  | Keep; hide what is missing                                                               |
| S12      | Keep the first-week state                                                                                     | Keep                                                                                     |
| S13      | "Read my website again" (uses`POST /scans`)                                                                 | Add; the owner's edits are kept                                                          |
| S15      | The 30-minute start: rule or setting                                                                          | Fixed rule                                                                               |
| S15      | Timezone change: posts keep clock time or exact moment                                                        | Keep the clock time                                                                      |
| S16      | "Delete for good" (the API only archives)                                                                     | Archive is the main action; a real delete is a backend task                              |
| AUTH-7   | Who does the lost-access check                                                                                | Cadence support on a video call                                                          |
| AUTH-7   | "Remember this device for 30 days" for admins                                                                 | No; every sign-in asks                                                                   |
| AUTH-7   | 5 wrong codes pause 15 minutes; 10 backup codes; warn at 2 left; recovery 1 working day plus 24 hours' notice | Yes                                                                                      |
| AUTH-7   | Optional two-factor for clients                                                                               | Yes, later, with the same manage screen                                                  |
| AUTH-7   | An "Account" item in the admin rail                                                                           | No; reach it from the account menu                                                       |
| AUTH-7   | One sample admin name across all mocks (Priya Shah, Alex Morgan, "SA" differ)                                 | Use one placeholder name everywhere when coding                                          |
| AUTH-7   | The manage page mock still shows the theme toggle in the bar                                                  | Follow the approved header: theme lives in the account menu                              |
| OBS      | What collects frontend errors                                                                                 | Sentry for errors and releases; SigNoz stays for the backend                             |
| OBS      | Server Action failures counted as "Failed API calls" under Frontend                                           | Yes; that is what the person saw                                                         |
| OBS      | Session replay                                                                                                | Not now (privacy)                                                                        |
| OBS      | Tab names "Server" and "Frontend"                                                                             | Keep                                                                                     |
| OBS      | Tag every release (time and commit) in the deploy                                                             | Yes                                                                                      |
| HDR, ADM | Admin navigation: HDR has Clients, Observability, Settings; ADM has Clients, Observability                    | Clients and Observability until admin settings exist                                     |
| HDR, ADM | Admin inside a brand: HDR puts a breadcrumb in the bar; ADM adds a dark strip above it                        | HDR breadcrumb, plus the strip's line "Posts you approve here are approved in your name" |
| ADM      | The clients list needs posts to approve, expired connections, failed runs and last activity per client        | Add them to`GET /admin/clients`                                                        |
| ADM      | Resend and cancel an invite have no endpoints                                                                 | Add both                                                                                 |
| ADM      | Reuse S17a for the brand kit check when an admin adds a brand                                                 | Yes                                                                                      |
| ADM      | A post the admin approves shows "approved by The Scale Agency" to the client                                  | Yes                                                                                      |
| HDR      | Move the theme toggle from the bar into the account menu                                                      | Yes                                                                                      |
| HDR      | "Ask the agent" in the admin area                                                                             | Leave it out; the agent works per brand                                                  |
| HDR      | Search in "Switch client"                                                                                     | Add when clients pass about 10                                                           |
| HDR      | "2 to approve" chips in the switcher                                                                          | Keep                                                                                     |
| HDR      | "Back" from adding a brand goes to the last brand                                                             | Yes                                                                                      |
| AUTH     | Google sign-in                                                                                                | Optional button; email and password stay the main way                                    |
| AUTH     | "Email already used" at sign-up, or always go to the code step and email the existing account                 | Always go to the code step (never reveals registered emails)                             |
| AUTH     | After a reset, sign in automatically or go to sign in                                                         | Go to sign in                                                                            |
| AUTH     | Lock after 5 wrong passwords for 15 minutes; codes 10 minutes; reset links 30 minutes; invites 7 days         | Yes                                                                                      |
| AUTH     | Expired invite: "Ask for a new invite" notifies the admin (needs an endpoint)                                 | Yes                                                                                      |
| AUTH     | Two-factor sign-in for admins (authenticator app or passkeys)                                                 | Yes, design it next                                                                      |
| AUTH     | A personal note from the admin in the invite                                                                  | Not now                                                                                  |
| BA-2       | Account page: "Back to `<last brand>`" with no rail, or keep the workspace rail | No rail; the account covers every brand                                    |
| BA-1       | "Add a brand" twice (page button and dashed tile)                                   | Keep both; the tile fills the grid                                         |
| BA-2       | "Where you're signed in" device list (needs session data)                           | Keep; Clerk and Better Auth both list sessions                             |
| BA-2       | Turning off two-factor asks for a code first                                        | Yes                                                                        |
| ST-1       | Workspace error title names the page ("Content didn't load")                        | Yes                                                                        |
| ST-1       | Support email `support@thescaleagency.org`; admins also get "Back to all clients"  | Email as designed (owner approved ST-1); yes to the admin link                          |
| ST-4, ST-5 | "Started 2 minutes ago" and "4 approved, 1 sent back" need data                     | Keep; the mock provides them, the API adds them later                      |
| ST-2       | Rail on a brand-level 404                                                           | No; the brand can't be named                                               |
| ST-5       | A blank calendar with no strategy yet                                               | Not needed; content empty covers it                                        |
| FL-2       | Failed posts pinned at the top of Content; where published posts sort in "All"      | Pin failed on top; then soonest first; published last                      |
| FL-2       | Approved S03 and S06 say "Post" but the rule says "Image post"                      | Code uses "Image post" everywhere; no redraw                               |
| FL-1       | Pre-tick Instagram and pre-pick Friendly and Straightforward                        | Yes; everything stays editable                                             |
| FL-1       | Fields needed before Continue                                                       | Name, what you do, who it's for, one platform                              |
| FL-5       | Version 2 gets the same 30-minute auto-start                                        | Yes                                                                        |
| FL-5       | Version 2 uses learnings written for Meow Meow Tweet                                | Fine for a mock                                                            |
| FL-4       | "We'll email you when the posts are ready"                                          | Yes; add it to the emails                                                  |
| BA-2       | Monospace on backup codes breaks the no-monospace rule                              | No change; AUTH-7 allows monospace only for the setup key and backup codes |
| DK-1 | Dark tints for every brand: a hand-written block per brand, or computed from the brand colour | Computed from the brand colour in `brand-theme.tsx`, like the accent (no `color-mix()`) |
| DK-1 | Check the proposed dark hex values before they become real CSS | Checked in the wave 3 browser check, light and dark |
| DK-1 | Warning notes: a dark-specific tint, or warning text on the existing dim tint | Warning text on the dim tint; add a tint only if contrast fails 4.5:1 |
| EM | Emails are sent by the API | Sending is a backend follow-up (section 6); the HTML is the approved template |

</details>

<a id="9-change-log"></a>

## 9. Change log

<details>
<summary>Show the log (newest first)</summary>

| Date       | Change                                                                                                                                                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-28 | Owner: admin brand pages move under the admin area (`/admin/c/:brandId/...`), admin onboarding at `/admin/clients/:clientId/brands/new` |
| 2026-09-28 | Owner: admin onboarding of a client's brand uses the same full flow as the client (replaces the short ADM-5 dialog); skip or send a connect link; answers marked "Answered by the agency" |
| 2026-09-28 | ADM-7 Admin settings added as a design task (owner: design later); the sidebar link that led to a 404 was removed |
| 2026-09-28 | Owner: admin route rename to one word, `c` (`/admin/c/:clientId/brand/new`); fixed a double-header bug from nesting the create page under the workspace layout by moving the workspace routes into their own `(workspace)` route group |
| 2026-09-28 | Wave 1 declared done: 3 rounds of design-match fixes, admin routing landed, 38/38 routes verified, build/types/lint clean; 4 small items left open for the owner |
| 2026-09-28 | ADM-7 Admin settings v1 designed: two tabs, Team (other admins, invite/remove) and Notifications (agency-wide email alerts); personal profile/password/two-factor stay in "Your account", not repeated. Built and self-checked at 1440/768/390, awaiting owner review |
| 2026-09-27 | Round 1 landed (foundation UI, data layer on mock); round 2 started with 7 agents (onboarding, strategy and research, overview and content, review and approvals, calendar and analytics, settings, admin and observability). All approved rows now coding |
| 2026-09-27 | Missing flows FL-1 to FL-5 designed (8 screens); in review                                                                                                                                                                                                 |
| 2026-09-27 | System states ST-1 to ST-5 designed (13 screens); in review                                                                                                                                                                                                |
| 2026-09-27 | BA-1 Your brands and BA-2 Your account designed; in review                                                                                                                                                                                                 |
| 2026-09-27 | Owner added a build review: every coded page is reviewed in the running app; changes asked, then build approved                                                                                                                                            |
| 2026-09-27 | Owner approved EM-1 to EM-8 and DK-1; all 73 designs approved; dark fixes added to wave 2 |
| 2026-09-27 | Added sections 4.11 Emails (EM-1 to EM-8) and 4.12 Dark mode check (DK-1); both in review |
| 2026-09-27 | Owner approved BA-1, BA-2, ST-1 to ST-5 and FL-1 to FL-5; all 64 screens approved; their open questions moved to decided; their coding added to wave 2 |
| 2026-09-27 | Section 2 now lists what is running and what needs the owner's approval; plan A wave 1 started on Sonnet (onboarding, review and approvals, overview and content, strategy, emails and dark check)                                                         |
| 2026-09-27 | Coding started: round 1 (foundation UI, data layer on mock, auth on Clerk behind our own interface)                                                                                                                                                        |
| 2026-09-27 | Started the last 13 items (brands and account, system states, missing flows, emails and checks), one agent each; the first launch on 2026-09-26 failed on the spend limit                                                                                  |
| 2026-09-26 | AUTH-7 now covers clients too: same screens, client differences as rules in section 5                                                                                                                                                                      |
| 2026-09-26 | AUTH-7 and observability v3 approved. Every design is approved; nothing in review                                                                                                                                                                          |
| 2026-09-26 | ADM-1 to ADM-6 approved (12 states); admin rules added; header breadcrumb chosen over the dark strip                                                                                                                                                       |
| 2026-09-26 | AUTH-7 designed (19 states); in review                                                                                                                                                                                                                     |
| 2026-09-26 | HDR approved (10 states); header rules added to section 5; its questions moved to decided                                                                                                                                                                  |
| 2026-09-26 | AUTH-7 admin two-factor sign-in started (one agent)                                                                                                                                                                                                        |
| 2026-09-26 | AUTH-1 to AUTH-6 approved (21 states); auth rules added to section 5; their questions moved to decided                                                                                                                                                     |
| 2026-09-26 | Tracker layout rebuilt: at a glance, waiting for the owner, one table per area, Stitch to-do                                                                                                                                                               |
| 2026-09-26 | Header, auth, admin and observability v3 designed by four parallel agents; in review. Class clash`.needs` fixed on the admin view                                                                                                                        |
| 2026-09-26 | S11 approved after two changes: coloured platform labels and a compact phone agenda. Every screen of the redesign is approved                                                                                                                              |
| 2026-09-26 | S10, S12, S13 to S16 approved; S03 and S04 rebuilt with "Ask for changes"                                                                                                                                                                                  |
| 2026-09-26 | S10 to S16 designed by four parallel agents                                                                                                                                                                                                                |
| 2026-09-26 | S09 approved: the swipe is back, with post type on each card and full details beside it                                                                                                                                                                    |
| 2026-09-26 | S07 and S08 approved; S08 is the one review panel, with editable date and time                                                                                                                                                                             |
| 2026-09-26 | S06 approved (row hover as one unit). Stitch uploads paused by the owner                                                                                                                                                                                   |
| 2026-09-26 | S03 and S04 approved (post type and platform on every post). Class clash`.sheet` fixed                                                                                                                                                                   |
| 2026-09-26 | S05 retired; S20 designs the same page                                                                                                                                                                                                                     |
| 2026-09-26 | S19, S20 and S21 approved                                                                                                                                                                                                                                  |
| 2026-09-26 | S18 approved as a chat; S17a to S17c approved                                                                                                                                                                                                              |
| 2026-09-26 | S01 v3 and S02 v4 approved                                                                                                                                                                                                                                 |
| 2026-09-26 | Tracker started; replaces`design/web-v2/APPROVALS.md`                                                                                                                                                                                                    |

</details>

[approved]: https://img.shields.io/badge/approved-brightgreen
[review]: https://img.shields.io/badge/in_review-orange
[rejected]: https://img.shields.io/badge/rejected-red
[notcoded]: https://img.shields.io/badge/not_coded-lightgrey
[coding]: https://img.shields.io/badge/coding-blue
[builtreview]: https://img.shields.io/badge/build_in_review-orange
[changes]: https://img.shields.io/badge/changes_asked-red
[coded]: https://img.shields.io/badge/build_approved-brightgreen
