# Competitor read checklist

As of 2026-09. A page read returns up to 6,000 characters of main text; that is usually the home page's headline, first sections and footer. Read for the items below, in this order, and record only what the text says.

## What to read, where, and what it tells you

| Item | Where it is | What to record | What it tells you |
|---|---|---|---|
| Positioning line | the home page headline or the sentence beside the logo | verbatim | what they think they are selling; the cliché test in Step 4 runs on this |
| Lead offer | the first call to action and the first product or service named | the offer and the verb (book, order, call, quote) | how they want to be bought; a booking button and a phone number are different funnels |
| Prices | menu, pricing, services or treatments page; "from" figures on the home page | the figures, with "as of <month>" | the price band, and whether this business is a competitor at all (within roughly 2x) |
| Proof | home page and about page | years, review count and rating shown, awards, accreditations, named people, named suppliers | what they can prove; the "says it badly" test looks for promises without this |
| Audience address | who the copy talks to ("for busy families", "for landlords", "for offices") | the phrase | the raw material for `competitorAudienceNotes`; note it in `competitors[].note` |
| Catchment | footer address, "areas we cover", delivery radius | the area | whether the customer can actually choose them instead |
| Where they post | footer social links, "follow us" | platform names only | which platforms this category's customers are assumed to use; not evidence of activity |
| Silence | what a customer would want and the page does not say (prices, response time, who does the work) | "does not mention X" | the "nobody says" test; silence is a fact about the page, never a claim about the business |

## Reading social profiles

| Platform | Readable by `read-page` as of 2026-09 | What a search snippet can give |
|---|---|---|
| Instagram | usually not; login wall or empty shell | sometimes a follower count and bio text in the description |
| Facebook page | usually not; login wall | page name and category |
| TikTok | sometimes the profile bio and a few captions; often blocked | follower count in the description now and then |
| LinkedIn company page | not without login | tagline and headcount band in the description |
| YouTube channel | often readable (about page, titles) | channel description |
| Google Maps listing | partial: name, rating and review count in the snippet; reviews rarely | rating and review count |

When a profile cannot be read, write "profile not readable" and stop. Do not infer frequency from the existence of a link, and do not quote a follower count you saw only in a snippet without "(from search snippet, as of <month>)".

## Writing the note: allowed and not allowed

| Allowed (an observation from read text) | Not allowed (a judgement or an unread fact) |
|---|---|
| "Leads with next-day fitting" | "Faster than us" or "slower than us" |
| "Lists prices per job; callout from 60 (as of 2026-09)" | "Expensive", "cheap", "overpriced" |
| "Shows 214 Google reviews at 4.7 on the site" | "Has better reviews", "reviews are fake" |
| "Names two engineers and their years" | "Small team, probably stretched" |
| "Does not mention response times" | "Slow to respond" |
| "Copy addressed to landlords and letting agents" | "Only works for landlords" |
| "Owner says they undercut on boiler swaps; not verified" | "Undercuts on boiler swaps" |
| "Profile not readable; posting pace unknown" | "Posts daily", "barely posts" |

## The three tests, with the evidence they need

| Test | Needs | Writes into `opening` |
|---|---|---|
| What nobody says | a customer need from questionnaire or reviews, and 3+ competitors whose positioning line ignores it | the need, and the specific this brand can show for it now |
| What everybody says the same | the same claim on 3+ positioning lines | the claim named as the category cliché, and the specific proof this brand offers instead |
| What everybody says badly | a promise on 2+ sites with no proof beside it | the promise, and the proof this brand has (from site facts or questionnaire), or the question to the owner if it does not have it yet |

An opening built on a claim the brand cannot substantiate today goes to `openQuestions`, not to `opening`.
