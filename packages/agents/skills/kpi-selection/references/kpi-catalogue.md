# KPI catalogue by business model

As of 2026-09. Re-check the "what each source can give" table when a platform API or a phase changes.

## The business result and its leading indicators, by how people buy

| Business model | Tier-1 result (owner reports) | Tier-2 attribution (only when the path exists) | Tier-3 leading indicators (once accounts connect) | Typical baseline question |
|---|---|---|---|---|
| Walk-in retail, café, restaurant, salon | transactions by day-part; new vs returning share; average ticket | a post-only offer or code redeemed at the till; "how did you hear" asked at the counter for a week | profile visits, saves, shares, "is this on today?" comments, local follows | "Transactions on a quiet day vs a busy day last month?" |
| Booking service (dentist, clinic, salon by appointment, tutor, studio) | bookings per week by type; first-time bookings; no-show rate; value per booking | booking-form field "treatment of interest" + "how did you hear"; a booking link used only in bios and posts | link taps, booking-page visits, DMs asking availability or price | "Bookings last month, by type, and how many were new?" |
| Enquiry or quote trade (plumber, electrician, builder, agency, consultant) | enquiries per week; quote-to-job rate; average job value | form field "how did you hear"; a phone number shown only on social | DMs, profile visits, saves of "how to" posts, shares within local groups | "Enquiries last month, and how many became jobs?" |
| Online shop (D2C) | orders per week; average order value; returning-customer share (all in the shop back-end) | UTM links in bio and posts; a social-only discount code | link taps, product-tag taps, saves, shares, comments asking about sizes or shipping | "Orders and average order value last month?" |
| Subscription or membership (gym, box, club, course) | sign-ups per month; churn; average tenure | sign-up page with "how did you hear"; a social-only trial code | link taps, DMs asking about price or cancellation, saves of schedule posts | "Sign-ups and cancellations last month?" |
| B2B service | qualified enquiries per month; proposals sent; average contract value | a booking page for calls; "how did you hear" on the enquiry form | profile visits from target-company employees, shares, comments from buyers, DMs | "Qualified enquiries last quarter, and what share came from referrals?" |

Rules read alongside the table:

- "New vs returning share" needs a way to tell them apart. Without one (no loyalty scheme, no CRM), ask in `openQuestions` and do not list the KPI until the owner has a method.
- "Average job value" and "average contract value" only when `orderValue` or the owner's note gives a starting number; otherwise the KPI is the count, and the value is an open question.
- A `launch` goal takes the launched item's own count (units, bookings, sign-ups) in place of the row's tier-1 result, for the launch window only.

## Leading indicator by bottleneck

| Bottleneck | The indicator that moves first | Why it predicts the result | Not this |
|---|---|---|---|
| `awareness` | reach among local or in-category accounts; profile visits | people who did not know the brand now look at it | total impressions (includes existing followers and far-away viewers) |
| `trust` | saves, shares, DMs asking a question, comment replies | a save is "I might buy this later"; a question is a buyer with one doubt left | likes (cheap and unspecific) |
| `conversion` | link taps, booking-page visits, DMs asking to book or order | the last step before money | reach (already past that step) |
| `repeat` | returning-customer share; comments and DMs from known customers; shares of a schedule or menu | a returning customer is the KPI; a shared schedule is a plan to return | follower growth (new people are not repeat) |
| `orderValue` | share of orders including the priority offer; DMs asking about the higher-value item | the order gets bigger only if that item is asked for | any volume metric |

## What each data source can give, by phase

| Source | Phase 2B (now) | Phase 5 (accounts connected) | Notes |
|---|---|---|---|
| Owner questionnaire | `orderValue`, `capacity`, best sellers, goal | same, edited in Settings | the only source of margins and capacity; never inferred |
| Scanned site facts | prices, booking or order path present, phone, review widget and count if shown | same, re-scanned | prices bound the order value; a booking form makes tier-2 possible |
| Owner's monthly report | none until asked; the brief asks | monthly numbers the Performance Analyst reads | the tier-1 source; keep it to numbers countable in five minutes |
| Public profile read (`read-page`) | often blocked by login walls (Instagram, Facebook, LinkedIn as of 2026-09); sometimes a follower count from a search snippet | not needed | treat any count as approximate and dated |
| Instagram and Facebook insights (Meta) | not available | reach, profile visits, website taps, saves, shares, follows, DMs (per post and per period) | metric names and windows change; verify at connection time |
| TikTok analytics | not available | video views, profile views, shares, follows | 7 and 28-day windows; small accounts see noisy numbers |
| LinkedIn page analytics | not available | impressions, clicks, followers by company and title | B2B only; personal profiles give less |
| Shop or booking back-end | only what the owner reports | owner reports, or an integration later | orders, order value, returning share are read here, never from social |

## Wording that a small business believes

- Say the count, the window and the counter: "New bookings per week, from the booking system, reported by the practice on the 1st."
- Say what would make it wrong: "If summer is normally slow, the first two months read low; compare to last year's same months."
- A target is a range with a date when a baseline exists ("from 12 to 14-15 a week by December"), and a baseline sentence when it does not.
- Do not stack more than three business numbers; the owner reads a dashboard once and then reads the top line.
