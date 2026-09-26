# Design tracker

![approved](https://img.shields.io/badge/approved-52-brightgreen)
![in review](https://img.shields.io/badge/in_review-0-orange)
![coded](https://img.shields.io/badge/coded-0_of_52-blue)
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
- [5. Rules to carry into code](#5-rules-to-carry-into-code)
- [6. Backend follow-ups](#6-backend-follow-ups)
- [7. Stitch to-do](#7-stitch-to-do)
- [8. Decided questions](#8-decided-questions)
- [9. Change log](#9-change-log)

<a id="1-at-a-glance"></a>

## 1. At a glance

| Area | Screens | Approved | In review | Coded |
|---|---:|---:|---:|---:|
| [Onboarding](#41-onboarding) | 14 | 14 | 0 | 0 |
| [Strategy and research](#42-strategy-and-research) | 5 | 5 | 0 | 0 |
| [Brand workspace](#43-brand-workspace) | 13 | 13 | 0 | 0 |
| [Header](#44-header) | 1 | 1 | 0 | 0 |
| [Auth](#45-auth) | 7 | 7 | 0 | 0 |
| [Admin](#46-admin) | 6 | 6 | 0 | 0 |
| [Observability](#47-observability) | 6 | 6 | 0 | 0 |
| **Total** | **52** | **52** | **0** | **0** |

OBS-1 and OBS-4 moved to v3; v2 stays only as history. S05 is retired and not counted.

<a id="2-waiting-for-the-owner"></a>

## 2. Waiting for the owner

Every design is approved and every question is decided ([section 8](#8-decided-questions)). Two things wait for the owner's go:

- **Stitch:** upload the approved screens and delete the old ones by hand ([section 7](#7-stitch-to-do)).
- **Code:** build the approved screens in `apps/web`.

<a id="3-how-it-works"></a>

## 3. How it works

The owner's rule for frontend work (full text in [`AGENTS.md`](../AGENTS.md), "Design before frontend code"):

1. **Design** the screens as HTML from the real design system in `design/<feature>/`, responsive at 1440, 768 and 390, with no sideways scrolling.
2. **Review:** open them in a visible Playwright browser as one sheet (each screen at the three widths side by side).
3. **Decide:** the owner approves or rejects. Rejected: design the next version. Nothing goes to Stitch before approval.
4. **Approved:** mark the row, delete the versions that were not approved, and upload to Stitch only when the owner says so.
5. **Code** it in `apps/web` only when the owner says so. Check it in the running app, then mark the row coded.

<details>
<summary>How to read the tables</summary>

- **ID** is the screen's permanent name. A new state gets a letter (S18a, S18b); a new design gets a version (v2, v3).
- **Design** links open the HTML on VS Code Live Server with the repo root as its root (`http://127.0.0.1:5500/`): right-click the repo, "Open with Live Server", then click. Resize the browser to check 1440, 768 and 390.
- **As built** links the screen as the app looks today (`design/current-app/screens/`). "New" means `apps/web` has no such screen.
- **Status:** ![approved][approved] can be coded, ![in review][review] waiting for the owner, ![rejected][rejected] replaced or redesigned.
- **Stitch:** ✓ on the canvas of project `330652592731776730`; **–** not uploaded; **missing** was uploaded but is no longer on the canvas.
- **Code:** ![not coded][notcoded], ![coding][coding], ![coded][coded] (built and checked against the design).

</details>

<a id="4-screens"></a>

## 4. Screens

Link bases: designs in `design/web-v2/`, observability in `design/observability/`.

<a id="41-onboarding"></a>

### 4.1 Onboarding

Website, scan, brand kit, connect accounts (optional), questionnaire, research. Route `/onboarding`.

| ID | Screen | Design | As built | Status | Stitch | Code | Notes |
|---|---|---|---|---|---|---|---|
| S01 | Website step | [empty](http://127.0.0.1:5500/design/web-v2/screens-s01/s01-v3-empty.html), [typed](http://127.0.0.1:5500/design/web-v2/screens-s01/s01-v3-typed.html), [invalid](http://127.0.0.1:5500/design/web-v2/screens-s01/s01-v3-error.html) | [open](http://127.0.0.1:5500/design/current-app/screens/01-onboarding.html) | ![approved][approved] v3 | ✓ | ![not coded][notcoded] | |
| S02 | Scanning | [running](http://127.0.0.1:5500/design/web-v2/screens-s02/s02-v4-running.html) (v4), [failed](http://127.0.0.1:5500/design/web-v2/screens-s02/s02-v3-failed.html) (v3) | [open](http://127.0.0.1:5500/design/current-app/screens/17-onboarding-scanning.html) | ![approved][approved] v4 | ✓ | ![not coded][notcoded] | |
| S17a | Check your brand kit | [open](http://127.0.0.1:5500/design/web-v2/screens-s17/s17a-brand-kit-review.html) | New | ![approved][approved] v1 | ✓ | ![not coded][notcoded] | Edit what the scan found; pick platforms |
| S17b | Connect accounts | [open](http://127.0.0.1:5500/design/web-v2/screens-s17/s17b-connect-accounts.html) | New | ![approved][approved] v1 | ✓ | ![not coded][notcoded] | Optional; "Skip, connect later" |
| S17c | Instagram connected | [open](http://127.0.0.1:5500/design/web-v2/screens-s17/s17c-connect-accounts-connected.html) | New | ![approved][approved] v1 | ✓ | ![not coded][notcoded] | Desktop and phone only |
| S18a | Questionnaire: start, pick language | [open](http://127.0.0.1:5500/design/web-v2/screens-s18/s18a-start.html) | New | ![approved][approved] v2 | ✓ | ![not coded][notcoded] | |
| S18b | Questionnaire: confirm the website | [open](http://127.0.0.1:5500/design/web-v2/screens-s18/s18b-confirm.html) | New | ![approved][approved] v3 | ✓ | ![not coded][notcoded] | Text box only after "Not quite, let me fix it" |
| S18c | Questionnaire: something else | [open](http://127.0.0.1:5500/design/web-v2/screens-s18/s18c-something-else.html) | New | ![approved][approved] v3 | ✓ | ![not coded][notcoded] | "Something else" opens the text box |
| S18d | Questionnaire: follow-up | [open](http://127.0.0.1:5500/design/web-v2/screens-s18/s18d-follow-up.html) | New | ![approved][approved] v3 | ✓ | ![not coded][notcoded] | |
| S18e | Questionnaire: summary | [open](http://127.0.0.1:5500/design/web-v2/screens-s18/s18e-summary.html) | New | ![approved][approved] v2 | ✓ | ![not coded][notcoded] | Approval starts research |
| S18f | Questionnaire: change an answer | [open](http://127.0.0.1:5500/design/web-v2/screens-s18/s18f-edit-answer.html) | New | ![approved][approved] v1 | ✓ | ![not coded][notcoded] | Bottom sheet on phone |
| S19a | Research running | [open](http://127.0.0.1:5500/design/web-v2/screens-s19/s19a-research-running.html) | New | ![approved][approved] v1 | ✓ | ![not coded][notcoded] | Steps: gather, diagnose, profile, save |
| S19b | Research done | [open](http://127.0.0.1:5500/design/web-v2/screens-s19/s19b-research-done.html) | New | ![approved][approved] v1 | ✓ | ![not coded][notcoded] | "See your first month" |
| S19c | Research stopped | [open](http://127.0.0.1:5500/design/web-v2/screens-s19/s19c-research-failed.html) | New | ![approved][approved] v1 | ✓ | ![not coded][notcoded] | Answers are saved; try again resumes |

<a id="42-strategy-and-research"></a>

### 4.2 Strategy and research

Route `/c/:brandId/strategy`. S20 replaces the old S05 design of this page.

| ID | Screen | Design | As built | Status | Stitch | Code | Notes |
|---|---|---|---|---|---|---|---|
| S20a | Strategy draft, 30-minute window | [open](http://127.0.0.1:5500/design/web-v2/screens-s20/s20a-strategy-draft.html) | [open](http://127.0.0.1:5500/design/current-app/screens/05-strategy.html) | ![approved][approved] v1 | missing | ![not coded][notcoded] | Countdown ring; "Start now" or "Ask for changes" |
| S20b | Ask for changes | [open](http://127.0.0.1:5500/design/web-v2/screens-s20/s20b-ask-for-changes.html) | [open](http://127.0.0.1:5500/design/current-app/screens/05-strategy.html) | ![approved][approved] v1 | missing | ![not coded][notcoded] | A redraft starts a fresh 30 minutes |
| S20c | Started on its own | [open](http://127.0.0.1:5500/design/web-v2/screens-s20/s20c-strategy-started.html) | [open](http://127.0.0.1:5500/design/current-app/screens/05-strategy.html) | ![approved][approved] v1 | missing | ![not coded][notcoded] | When `approved_by` is null after 30 minutes |
| S21a | Research (`/strategy/research`) | [open](http://127.0.0.1:5500/design/web-v2/screens-s21/s21a-research.html) | New | ![approved][approved] v1 | missing | ![not coded][notcoded] | Sources, version, "Run research again" |
| S21b | Research running again | [open](http://127.0.0.1:5500/design/web-v2/screens-s21/s21b-research-again.html) | New | ![approved][approved] v1 | missing | ![not coded][notcoded] | Current version stays readable |
| S05 | Strategy (old v2) | Replaced by S20 | [open](http://127.0.0.1:5500/design/current-app/screens/05-strategy.html) | ![rejected][rejected] | delete by hand | – | Code the strategy page from S20 |

<a id="43-brand-workspace"></a>

### 4.3 Brand workspace

Route prefix `/c/:brandId`. Every screen is designed at 1440, 768 and 390.

| ID | Screen | Design | As built | Status | Stitch | Code | Notes |
|---|---|---|---|---|---|---|---|
| S03 | Overview | [open](http://127.0.0.1:5500/design/web-v2/screens-s03/s03-v3-overview.html) | [open](http://127.0.0.1:5500/design/current-app/screens/02-overview.html) | ![approved][approved] v3 | phone only | ![not coded][notcoded] | "This week" with platform and format; "Open calendar" |
| S04 | Overview with agent chat | [open](http://127.0.0.1:5500/design/web-v2/screens-s04/s04-v3-overview-agent-chat.html) | [open](http://127.0.0.1:5500/design/current-app/screens/03-overview-agent-chat.html) | ![approved][approved] v3 | ✓ | ![not coded][notcoded] | Full-screen chat on phone |
| S06 | Content | [open](http://127.0.0.1:5500/design/web-v2/screens-s06/s06-v3-content.html) | [open](http://127.0.0.1:5500/design/current-app/screens/06-content.html) | ![approved][approved] v3 | – | ![not coded][notcoded] | "Where it goes" column; Review button in the row |
| S07 | Content, needs approval | [open](http://127.0.0.1:5500/design/web-v2/screens-s07/s07-v3-needs-approval.html) | [open](http://127.0.0.1:5500/design/current-app/screens/07-content-needs-approval.html) | ![approved][approved] v3 | – | ![not coded][notcoded] | "Review one by one" |
| S08 | Review post | [open](http://127.0.0.1:5500/design/web-v2/screens-s08/s08-v3-review-post.html) | [open](http://127.0.0.1:5500/design/current-app/screens/08-content-post-panel.html) | ![approved][approved] v3 | – | ![not coded][notcoded] | The one review panel; date and time editable |
| S09 | Approvals | [idle](http://127.0.0.1:5500/design/web-v2/screens-s09/s09a-approvals.html), [swipe right](http://127.0.0.1:5500/design/web-v2/screens-s09/s09b-swipe-right-approve.html), [swipe left](http://127.0.0.1:5500/design/web-v2/screens-s09/s09c-swipe-left-reject.html), [undo](http://127.0.0.1:5500/design/web-v2/screens-s09/s09d-undo-after-reject.html) | [open](http://127.0.0.1:5500/design/current-app/screens/09-approvals.html) | ![approved][approved] v3 | – | ![not coded][notcoded] | Swipe stack kept from the built app |
| S10 | Full screen viewer | [carousel](http://127.0.0.1:5500/design/web-v2/screens-s10/s10-v3-carousel.html), [reel](http://127.0.0.1:5500/design/web-v2/screens-s10/s10-v3-reel.html), [phone swipe](http://127.0.0.1:5500/design/web-v2/screens-s10/s10-v3-phone-swipe.html), [after approve](http://127.0.0.1:5500/design/web-v2/screens-s10/s10-v3-after-approve.html) | [open](http://127.0.0.1:5500/design/current-app/screens/10-approvals-image-full-size.html) | ![approved][approved] v3 | – | ![not coded][notcoded] | Decide without closing |
| S11 | Calendar | [month](http://127.0.0.1:5500/design/web-v2/screens-s11/s11-v3-month.html), [drag](http://127.0.0.1:5500/design/web-v2/screens-s11/s11-v3-drag.html), [moved](http://127.0.0.1:5500/design/web-v2/screens-s11/s11-v3-moved.html), [day](http://127.0.0.1:5500/design/web-v2/screens-s11/s11-v3-day.html), [post](http://127.0.0.1:5500/design/web-v2/screens-s11/s11-v3-post.html), [phone month](http://127.0.0.1:5500/design/web-v2/screens-s11/s11-v3-phone-month.html) | [open](http://127.0.0.1:5500/design/current-app/screens/11-calendar.html) | ![approved][approved] v3 | – | ![not coded][notcoded] | Coloured platform labels; compact phone agenda |
| S12 | Analytics | [empty](http://127.0.0.1:5500/design/web-v2/screens-s12/s12-v3-empty.html), [first week](http://127.0.0.1:5500/design/web-v2/screens-s12/s12-v3-first-week.html), [a month](http://127.0.0.1:5500/design/web-v2/screens-s12/s12-v3-month.html) | [open](http://127.0.0.1:5500/design/current-app/screens/12-analytics-empty.html) | ![approved][approved] v3 | – | ![not coded][notcoded] | Every number judged in plain words |
| S13 | Settings, brand kit | [view](http://127.0.0.1:5500/design/web-v2/screens-s13/s13-v3-brand-kit.html), [editing](http://127.0.0.1:5500/design/web-v2/screens-s13/s13-v3-brand-kit-editing.html) | [open](http://127.0.0.1:5500/design/current-app/screens/13-settings-brand-kit.html) | ![approved][approved] v3 | – | ![not coded][notcoded] | Same cards as S17a |
| S14 | Settings, social accounts | [accounts](http://127.0.0.1:5500/design/web-v2/screens-s14/s14-v3-accounts.html), [none connected](http://127.0.0.1:5500/design/web-v2/screens-s14/s14-v3-accounts-none-connected.html), [connect failed](http://127.0.0.1:5500/design/web-v2/screens-s14/s14-v3-accounts-connect-failed.html) | [open](http://127.0.0.1:5500/design/current-app/screens/14-settings-social-accounts.html) | ![approved][approved] v3 | – | ![not coded][notcoded] | Expiry, reconnect, posts waiting |
| S15 | Settings, preferences | [preferences](http://127.0.0.1:5500/design/web-v2/screens-s15/s15-v3-preferences.html), [saved](http://127.0.0.1:5500/design/web-v2/screens-s15/s15-v3-preferences-saved.html) | [open](http://127.0.0.1:5500/design/current-app/screens/15-settings-preferences.html) | ![approved][approved] v3 | – | ![not coded][notcoded] | Approval and 30-minute start always on |
| S16 | Settings, delete | [typing](http://127.0.0.1:5500/design/web-v2/screens-s16/s16-v3-delete-typing.html), [ready](http://127.0.0.1:5500/design/web-v2/screens-s16/s16-v3-delete-ready.html), [archived](http://127.0.0.1:5500/design/web-v2/screens-s16/s16-v3-archived.html) | [open](http://127.0.0.1:5500/design/current-app/screens/16-settings-delete-confirmation.html) | ![approved][approved] v3 | – | ![not coded][notcoded] | Archive instead; type the name to delete |

<a id="44-header"></a>

### 4.4 Header

Every page. Approved 2026-09-26. Builder: `design/web-v2/header_design.py`.

| ID | States | As built | Status | Stitch | Code | Notes |
|---|---|---|---|---|---|---|
| HDR | [client](http://127.0.0.1:5500/design/web-v2/screens-hdr/hdr-v1-client.html), [brand switcher](http://127.0.0.1:5500/design/web-v2/screens-hdr/hdr-v1-client-switcher-open.html), [account menu](http://127.0.0.1:5500/design/web-v2/screens-hdr/hdr-v1-client-account-open.html), [dark](http://127.0.0.1:5500/design/web-v2/screens-hdr/hdr-v1-client-dark.html), [admin area](http://127.0.0.1:5500/design/web-v2/screens-hdr/hdr-v1-admin-area.html), [admin menu](http://127.0.0.1:5500/design/web-v2/screens-hdr/hdr-v1-admin-area-account-open.html), [admin in a brand](http://127.0.0.1:5500/design/web-v2/screens-hdr/hdr-v1-admin-in-client.html), [switch client](http://127.0.0.1:5500/design/web-v2/screens-hdr/hdr-v1-admin-in-client-switcher-open.html), [onboarding](http://127.0.0.1:5500/design/web-v2/screens-hdr/hdr-v1-onboarding-first.html), [adding a brand](http://127.0.0.1:5500/design/web-v2/screens-hdr/hdr-v1-onboarding-add-brand.html) | [open](http://127.0.0.1:5500/design/current-app/screens/02-overview.html) | ![approved][approved] v1 | – | ![not coded][notcoded] | Theme in the account menu; bottom sheets on phone |

<a id="45-auth"></a>

### 4.5 Auth

Our own auth, replacing Clerk later. Approved 2026-09-26. As built: Clerk default, not captured. Builder: `design/web-v2/auth_screens.py`.

| ID | Screen | States | Route | Status | Code | Notes |
|---|---|---|---|---|---|---|
| AUTH-1 | Sign in | [default](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-sign-in.html), [wrong password](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-sign-in-wrong-password.html), [loading](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-sign-in-loading.html), [session ended](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-sign-in-session-ended.html) | `/sign-in` | ![approved][approved] v1 | ![not coded][notcoded] | Never says which field is wrong |
| AUTH-2 | Sign up | [default](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-sign-up.html), [email used](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-sign-up-email-used.html), [weak password](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-sign-up-weak-password.html) | `/sign-up` | ![approved][approved] v1 | ![not coded][notcoded] | Live password rules |
| AUTH-3 | Email code | [default](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-verify-email.html), [wrong code](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-verify-email-wrong-code.html), [expired](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-verify-email-expired.html), [new code sent](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-verify-email-new-code-sent.html) | `/verify` | ![approved][approved] v1 | ![not coded][notcoded] | Paste and autofill work |
| AUTH-4 | Forgot and reset password | [forgot](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-forgot-password.html), [check email](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-check-email.html), [reset](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-reset-password.html), [changed](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-password-changed.html), [link expired](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-reset-link-expired.html) | `/forgot-password`, `/reset-password` | ![approved][approved] v1 | ![not coded][notcoded] | Never reveals if an email has an account |
| AUTH-5 | Accept an invite | [default](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-invite-accept.html), [loading](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-invite-accept-loading.html), [already used](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-invite-used.html), [expired](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-invite-expired.html) | `/invite/:token` | ![approved][approved] v1 | ![not coded][notcoded] | No code step; the link proves the email |
| AUTH-6 | Too many attempts | [open](http://127.0.0.1:5500/design/web-v2/screens-auth/auth-v1-too-many-attempts.html) | `/sign-in` | ![approved][approved] v1 | ![not coded][notcoded] | Countdown; reset still works |
| AUTH-7 | Admin two-factor sign-in | [setup](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-setup-choose.html), [app](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-setup-app.html), [app wrong code](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-setup-app-wrong-code.html), [passkey](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-setup-passkey.html), [passkey cancelled](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-setup-passkey-cancelled.html), [backup codes](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-setup-backup-codes.html), [sign in code](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-sign-in-code.html), [wrong code](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-sign-in-code-wrong.html), [sign in passkey](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-sign-in-passkey.html), [backup code](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-sign-in-backup-code.html), [codes low](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-sign-in-backup-codes-low.html), [paused](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-sign-in-paused.html), [lost access](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-lost-access.html), [request sent](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-lost-access-sent.html), [manage](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-manage.html), [last method](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-manage-last-method.html), [remove passkey](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-manage-remove-passkey.html), [new codes confirm](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-manage-new-codes-confirm.html), [new codes](http://127.0.0.1:5500/design/web-v2/screens-auth-2fa/2fa-v1-manage-new-codes.html) | `/sign-in`, admin account | ![approved][approved] v1 | ![not coded][notcoded] | Passkey recommended; backup codes shown once; no email-only recovery |

<a id="46-admin"></a>

### 4.6 Admin

The agency owner's area. Approved 2026-09-26. Builder: `design/web-v2/admin_screens.py`. All new; nothing built.

| ID | Screen | States | Route | Status | Code | Notes |
|---|---|---|---|---|---|---|
| ADM-1 | Clients (admin home) | [open](http://127.0.0.1:5500/design/web-v2/screens-admin/adm-v1-clients.html) | `/admin/clients` | ![approved][approved] v1 | ![not coded][notcoded] | Attention tiles; "needs you" first |
| ADM-2 | Clients, empty and error | [empty](http://127.0.0.1:5500/design/web-v2/screens-admin/adm-v1-clients-empty.html), [error](http://127.0.0.1:5500/design/web-v2/screens-admin/adm-v1-clients-error.html) | `/admin/clients` | ![approved][approved] v1 | ![not coded][notcoded] | |
| ADM-3 | Invite a client | [dialog](http://127.0.0.1:5500/design/web-v2/screens-admin/adm-v1-invite.html), [email in use](http://127.0.0.1:5500/design/web-v2/screens-admin/adm-v1-invite-email-in-use.html), [sent](http://127.0.0.1:5500/design/web-v2/screens-admin/adm-v1-invite-sent.html) | `/admin/clients` | ![approved][approved] v1 | ![not coded][notcoded] | |
| ADM-4 | Client detail | [active](http://127.0.0.1:5500/design/web-v2/screens-admin/adm-v1-client-detail.html), [invited](http://127.0.0.1:5500/design/web-v2/screens-admin/adm-v1-client-invited.html), [cancel invite](http://127.0.0.1:5500/design/web-v2/screens-admin/adm-v1-cancel-invite.html) | `/admin/clients/:id` | ![approved][approved] v1 | ![not coded][notcoded] | Brand cards with loop stage |
| ADM-5 | Add a brand for a client | [dialog](http://127.0.0.1:5500/design/web-v2/screens-admin/adm-v1-add-brand.html), [scan running](http://127.0.0.1:5500/design/web-v2/screens-admin/adm-v1-add-brand-reading.html) | `/admin/clients/:id` | ![approved][approved] v1 | ![not coded][notcoded] | Then S17a in admin context |
| ADM-6 | Viewing a brand as admin | [open](http://127.0.0.1:5500/design/web-v2/screens-admin/adm-v1-viewing-as-admin.html) | `/c/:brandId` | ![approved][approved] v1 | ![not coded][notcoded] | Code with the header breadcrumb, not the dark strip (section 5) |

<a id="47-observability"></a>

### 4.7 Observability

Admin only, routes planned under `/admin`. v2 builder: `design/observability/build.py`; v3 builder: `design/observability/obs_v3.py`.

| ID | Screen | v2 (approved) | v3 | Status | Stitch | Code | Notes |
|---|---|---|---|---|---|---|---|
| OBS-1 | Overview | [open](http://127.0.0.1:5500/design/observability/screens/overview.html) | [open](http://127.0.0.1:5500/design/observability/screens-v3/obs-v3-overview.html) | ![approved][approved] v3 | ✓ v2 | ![not coded][notcoded] | v3 adds one frontend number |
| OBS-2 | Agents | [open](http://127.0.0.1:5500/design/observability/screens/agents.html) | – | ![approved][approved] v2 | ✓ | ![not coded][notcoded] | |
| OBS-3 | Agent run detail | [open](http://127.0.0.1:5500/design/observability/screens/run-detail.html) | – | ![approved][approved] v2 | ✓ | ![not coded][notcoded] | |
| OBS-4 | Server | [open](http://127.0.0.1:5500/design/observability/screens/server.html) | [open](http://127.0.0.1:5500/design/observability/screens-v3/obs-v3-server.html) | ![approved][approved] v3 | ✓ v2 | ![not coded][notcoded] | v3 is backend only |
| OBS-5 | Frontend | – | [open](http://127.0.0.1:5500/design/observability/screens-v3/obs-v3-frontend.html) | ![approved][approved] v1 | – | ![not coded][notcoded] | Errors, failed actions, failed API calls |
| OBS-6 | Frontend error detail | – | [open](http://127.0.0.1:5500/design/observability/screens-v3/obs-v3-error-detail.html) | ![approved][approved] v1 | – | ![not coded][notcoded] | What the person did; where in our code |

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

<a id="6-backend-follow-ups"></a>

## 6. Backend follow-ups

| From | Change | Where |
|---|---|---|
| S18c | Accept a free-text answer (`other:` prefix) on choice and range questions; code reads facts only from tapped options | `packages/agents/src/account-manager/answers.ts` |
| S21 | Research returns sources with a kind and a note, plus version history; a re-run keeps the current version readable | Research endpoints |
| S20b | "Ask for changes" sends the owner's request to the Strategist and drafts the next version with a fresh 30 minutes | Strategy endpoints (2B-2) |
| S09d | Store an optional reject reason and pass it to the learning loop | Posts, learnings |
| S16 | `DELETE /brands/:id` only archives. A real delete and a restore are missing | Brands endpoints |
| S12 | A "small shops like yours" benchmark per brand; per-post followers and reel watch time depend on the Instagram API | Research, metrics |
| S17b, S09 | The publisher holds approved posts whose account is not connected and sends them once connected | Publisher (not built) |
| ADM-1 | `GET /admin/clients` returns posts to approve, expired connections, failed runs and last activity per client | Admin endpoints |
| ADM-4 | Resend and cancel an invite | Admin endpoints |
| AUTH-5 | "Ask for a new invite" notifies the admin | Auth, admin |
| OBS-5 | Frontend error collection (Sentry recommended) and a tag on every release | Web app, deploy |

<a id="7-stitch-to-do"></a>

## 7. Stitch to-do

Project `330652592731776730`. Nothing is uploaded without the owner's approval.

**Upload, once the owner says so**

- Approved but not uploaded: S06 to S16, HDR, AUTH-1 to AUTH-7, ADM-1 to ADM-6, OBS-1 v3, OBS-4 v3, OBS-5, OBS-6.
- Missing from the canvas, upload again: S20a, S20b, S20c, S21a, S21b, and S03 v3 desktop and tablet.

**Delete by hand (the Stitch API cannot delete a screen)**

- Replaced versions: S01 v1 and v2, S02 v2 and v3 scanning, S05, and the "Redesign v2" set of S03, S04, S06 to S16.
- S18 v1 (the form) and S18 v2 b, c, d.

<a id="8-decided-questions"></a>

## 8. Decided questions

Questions on approved designs. The recommendation applies unless the owner says otherwise.

<details>
<summary>Show the 44 decisions</summary>

| From | Question | Decision |
|---|---|---|
| S10 | Viewer keys: ← → move slides; A, R, E decide (the Approvals stack uses ← → to decide) | Keep the split |
| S10 | "Ask for changes" from a slide starts with "Slide 2: …" | Yes |
| S10 | Format label "Image post" or "Post" | "Image post" everywhere |
| S10 | Reels open paused or play muted | Play muted, unless the device asks for reduced motion |
| S11 | "Scheduled" or "Approved, waiting for Instagram" while not connected | The honest label everywhere, S03 included |
| S11 | A past month with published posts | Not needed; S12 covers results |
| S11 | Tapping a free best time asks the agent to draft a post | Yes; the draft still needs approval |
| S12 | Compare with "small shops like yours" | Keep; research stores a benchmark |
| S12 | Numbers the API may not give | Keep; hide what is missing |
| S12 | Keep the first-week state | Keep |
| S13 | "Read my website again" (uses `POST /scans`) | Add; the owner's edits are kept |
| S15 | The 30-minute start: rule or setting | Fixed rule |
| S15 | Timezone change: posts keep clock time or exact moment | Keep the clock time |
| S16 | "Delete for good" (the API only archives) | Archive is the main action; a real delete is a backend task |
| AUTH-7 | Who does the lost-access check | Cadence support on a video call |
| AUTH-7 | "Remember this device for 30 days" for admins | No; every sign-in asks |
| AUTH-7 | 5 wrong codes pause 15 minutes; 10 backup codes; warn at 2 left; recovery 1 working day plus 24 hours' notice | Yes |
| AUTH-7 | Optional two-factor for clients | Yes, later, with the same manage screen |
| AUTH-7 | An "Account" item in the admin rail | No; reach it from the account menu |
| AUTH-7 | One sample admin name across all mocks (Priya Shah, Alex Morgan, "SA" differ) | Use one placeholder name everywhere when coding |
| AUTH-7 | The manage page mock still shows the theme toggle in the bar | Follow the approved header: theme lives in the account menu |
| OBS | What collects frontend errors | Sentry for errors and releases; SigNoz stays for the backend |
| OBS | Server Action failures counted as "Failed API calls" under Frontend | Yes; that is what the person saw |
| OBS | Session replay | Not now (privacy) |
| OBS | Tab names "Server" and "Frontend" | Keep |
| OBS | Tag every release (time and commit) in the deploy | Yes |
| HDR, ADM | Admin navigation: HDR has Clients, Observability, Settings; ADM has Clients, Observability | Clients and Observability until admin settings exist |
| HDR, ADM | Admin inside a brand: HDR puts a breadcrumb in the bar; ADM adds a dark strip above it | HDR breadcrumb, plus the strip's line "Posts you approve here are approved in your name" |
| ADM | The clients list needs posts to approve, expired connections, failed runs and last activity per client | Add them to `GET /admin/clients` |
| ADM | Resend and cancel an invite have no endpoints | Add both |
| ADM | Reuse S17a for the brand kit check when an admin adds a brand | Yes |
| ADM | A post the admin approves shows "approved by The Scale Agency" to the client | Yes |
| HDR | Move the theme toggle from the bar into the account menu | Yes |
| HDR | "Ask the agent" in the admin area | Leave it out; the agent works per brand |
| HDR | Search in "Switch client" | Add when clients pass about 10 |
| HDR | "2 to approve" chips in the switcher | Keep |
| HDR | "Back" from adding a brand goes to the last brand | Yes |
| AUTH | Google sign-in | Optional button; email and password stay the main way |
| AUTH | "Email already used" at sign-up, or always go to the code step and email the existing account | Always go to the code step (never reveals registered emails) |
| AUTH | After a reset, sign in automatically or go to sign in | Go to sign in |
| AUTH | Lock after 5 wrong passwords for 15 minutes; codes 10 minutes; reset links 30 minutes; invites 7 days | Yes |
| AUTH | Expired invite: "Ask for a new invite" notifies the admin (needs an endpoint) | Yes |
| AUTH | Two-factor sign-in for admins (authenticator app or passkeys) | Yes, design it next |
| AUTH | A personal note from the admin in the invite | Not now |

</details>

<a id="9-change-log"></a>

## 9. Change log

<details>
<summary>Show the log (newest first)</summary>

| Date | Change |
|---|---|
| 2026-09-26 | AUTH-7 and observability v3 approved. Every design is approved; nothing in review |
| 2026-09-26 | ADM-1 to ADM-6 approved (12 states); admin rules added; header breadcrumb chosen over the dark strip |
| 2026-09-26 | AUTH-7 designed (19 states); in review |
| 2026-09-26 | HDR approved (10 states); header rules added to section 5; its questions moved to decided |
| 2026-09-26 | AUTH-7 admin two-factor sign-in started (one agent) |
| 2026-09-26 | AUTH-1 to AUTH-6 approved (21 states); auth rules added to section 5; their questions moved to decided |
| 2026-09-26 | Tracker layout rebuilt: at a glance, waiting for the owner, one table per area, Stitch to-do |
| 2026-09-26 | Header, auth, admin and observability v3 designed by four parallel agents; in review. Class clash `.needs` fixed on the admin view |
| 2026-09-26 | S11 approved after two changes: coloured platform labels and a compact phone agenda. Every screen of the redesign is approved |
| 2026-09-26 | S10, S12, S13 to S16 approved; S03 and S04 rebuilt with "Ask for changes" |
| 2026-09-26 | S10 to S16 designed by four parallel agents |
| 2026-09-26 | S09 approved: the swipe is back, with post type on each card and full details beside it |
| 2026-09-26 | S07 and S08 approved; S08 is the one review panel, with editable date and time |
| 2026-09-26 | S06 approved (row hover as one unit). Stitch uploads paused by the owner |
| 2026-09-26 | S03 and S04 approved (post type and platform on every post). Class clash `.sheet` fixed |
| 2026-09-26 | S05 retired; S20 designs the same page |
| 2026-09-26 | S19, S20 and S21 approved |
| 2026-09-26 | S18 approved as a chat; S17a to S17c approved |
| 2026-09-26 | S01 v3 and S02 v4 approved |
| 2026-09-26 | Tracker started; replaces `design/web-v2/APPROVALS.md` |

</details>

[approved]: https://img.shields.io/badge/approved-brightgreen
[review]: https://img.shields.io/badge/in_review-orange
[rejected]: https://img.shields.io/badge/rejected-red
[notcoded]: https://img.shields.io/badge/not_coded-lightgrey
[coding]: https://img.shields.io/badge/coding-blue
[coded]: https://img.shields.io/badge/coded-brightgreen
