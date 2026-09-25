# Network audience data, thresholds and benchmark slots

Companion to `../SKILL.md`. Everything in section 1 changes; each row is dated. When `read-audience-insights` (phase 5) is built, it normalises what the networks return into `audienceDemographicsSchema` and `activeHoursSchema` in `packages/shared/src/schema/social.schema.ts`; this file says what can be expected to be there.

## 1. What each network reports about its audience (as of 2026-09)

Only the four platforms in `platformSchema` are listed. Verify a row against the live product before an agent leans on it; note the check date next to the row when you do.

| Network | Needs | Demographics reported | Active hours reported | Not reported | Checked |
|---|---|---|---|---|---|
| Instagram (professional account; Insights in app and Meta Business Suite) | 100 or more followers before the audience section appears | top cities, top countries, age ranges, gender, for followers | yes: followers online by hour for a chosen day and by day of week; windows of 7, 14, 30 and 90 days depending on the view; reported in the account's timezone setting | interests, income, whether a follower has bought, engaged-audience demographics (only followers) | 2026-09 |
| Facebook Page (Meta Business Suite Insights) | a Page with followers; small Pages show partial data | age and gender, top cities, top countries, for followers | a raw hourly grid is not reliably exposed since Page Insights moved into Business Suite; the scheduler shows suggested times instead. Treat `activeHours` as absent unless the integration returns it | interests, household data (retired from Insights), engaged-audience demographics | 2026-09 |
| TikTok (Business or Creator account; Analytics, Followers tab) | 100 or more followers for the Followers tab | gender, top territories (countries); an age-range breakdown appears in some regions and not others | yes: follower activity by hour and by day, 7-day and 28-day windows; historically displayed in UTC, so convert before reading | cities, income, interests beyond "videos your followers watched" | 2026-09 |
| LinkedIn Page (Page admin; Analytics, Followers and Visitors) | a Page with any followers; small Pages show counts but hide splits | location, job function, seniority, industry, company size, for followers and separately for visitors | no active-hours data of any kind | age, gender, personal interests | 2026-09 |

Google Business Profile is not a `platform` in this product. Its Performance report gives searches, views, calls, direction requests and website clicks by day, and the public "popular times" bar on Maps shows foot traffic by hour when a listing page can be read. Neither is audience demographics; both are demand signals a Strategist may cite for a café's or a clinic's buying moments.

## 2. Small-sample thresholds

| Data | Below this | What cannot be concluded |
|---|---|---|
| Followers | 100 | the networks withhold demographics; any share is invented |
| Followers | 1,000 | a difference under 10 percentage points between two shares |
| Followers | 5,000 | a city or country under 5 percent share is a rounding artefact |
| Active-hours window | 28 days | a weekly pattern; one week shows one week |
| Active-hours grid | maximum under 1.3 times the median cell | any timing at all; the grid is flat |
| Posts per format | 10 | that one format outperforms another |
| Posts per slot | 5 | that one day or time outperforms another |
| Engaged commenters | 10 | who the engaged audience is; read them as anecdotes |

When a number is below threshold, either say nothing or state the would-be conclusion and mark it `hypothesis`. Never let a small sample override the owner's answer or a review.

## 3. Reading a grid: worked calculation

`activeHours` is `{ mon: number[24], tue: ..., sun: ... }`, hour 0 first, followers online in that hour, days the network reports only. Suppose, after converting to the brand's timezone, the highest cells are:

```
sun[21] = 312   (grid maximum)
thu[21] = 288   (92%)   thu[13] = 271 (87%)
tue[13] = 265   (85%)   tue[21] = 259 (83%)
wed[21] = 240   (77%)   sat[10] = 233 (75%)
median cell = 96, so max / median = 3.25: the grid is not flat
```

Peaks are cells at 80 percent of the maximum or more: sun 21, thu 21, thu 13, tue 13, tue 21. `wed[21]` and `sat[10]` are below the line. For `perWeek: 3` on Instagram: three slots over at least two distinct days, none within 3 hours of another on the same day, each 30 to 60 minutes before its peak, on a 15-minute grid:

```
bestTimes: [
  { day: "tue", time: "12:30" },
  { day: "thu", time: "20:30" },
  { day: "sun", time: "20:15" }
]
```

`tue 21` was passed over for `tue 13` because the segment's buying moment (texting a clinic) is at lunch, and Sunday already takes an evening slot. Record the reason in `changeNote`. For `perWeek: 5`, add `thu 12:15` (3 or more hours from 20:30 is fine, and it is a separate peak) and `sat 09:30` only if the Saturday cell clears the 80 percent line in the next window; otherwise take `wed 20:15` as the fifth and say it is below the line.

## 4. Benchmark slots when there is no usable grid (as of 2026-09)

Generic, from published platform studies and agency practice; wide ranges on purpose. Use only when the brand's own results and its grid are both missing or below threshold, and say so. Local time of the brand.

| Platform | Weekdays | Weekends | Notes |
|---|---|---|---|
| Instagram | 07:00 to 09:00; 12:00 to 13:00; 19:00 to 21:00 | 09:00 to 11:00 | local consumer accounts peak in the evening; B2B-ish accounts at lunch |
| Facebook | 08:00 to 10:00; 12:00 to 14:00 | 09:00 to 12:00 | older local audiences check in the morning; groups and events drive weekend reach |
| TikTok | 07:00 to 09:00; 12:00 to 14:00; 19:00 to 23:00 | 10:00 to 12:00; 19:00 to 23:00 | discovery is search-like, so the slot matters less than the first hour of engagement |
| LinkedIn | Tue to Thu 08:00 to 10:00; 12:00 to 13:00 | avoid | no grid exists; weekday daytime is the only rule |

Sector adjustments the Strategist may apply and must state: cafés and bakeries move earlier (people decide before they leave); restaurants and bars move to 16:00 to 18:00 (booking tonight); clinics and trades sit at lunch and 20:00 to 21:30 (booking from the sofa); gifts and e-commerce peak Sunday evening.

## 5. Competitor audience: what is publicly readable (as of 2026-09)

- Instagram and Facebook profile pages: usually "could not read" through the safe fetcher. Search snippets show the bio, follower count and sometimes two recent post captions.
- TikTok profile pages: sometimes readable; follower count and pinned videos when they are.
- LinkedIn company pages: partly readable without login (follower count, about text, sometimes recent posts).
- Competitor websites: readable; testimonials and "as seen in" tell you who they sell to.

A note records what was read and when. What could not be read is written as such, never filled in.
