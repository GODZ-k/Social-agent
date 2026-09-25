# Segment dimensions: the questions, the evidence, the tests

As of 2026-09. Use with `customer-personas` Steps 1-3. Each row is one field of `audienceSegmentProfileSchema`, the question that fills it, where the answer is usually found, and an example that passes.

## The dimensions

| Field | The question to answer | Where the evidence usually is | Passes | Fails |
|---|---|---|---|---|
| `name` | Who is this, in the buying situation, in 3-7 words? | Step 1's situations | "Weekday commuter (primary)", "Landlord with three flats" | "Millennials", "Segment A", "Quality-seekers" |
| `summary` | What situation are they in, what do they buy, why does this segment exist, and why is it primary or secondary? 2-4 sentences | situations + brief's bottleneck and priority offers | says the situation, the purchase, the reason for primary, and what is unconfirmed | a demographic sketch with no purchase in it |
| `pains` | What is wrong or annoying before they buy, in their situation? | 1-2 star reviews of the brand and of competitors; forum threads; the site's FAQ | "a queue when the train is in 6 minutes" | "lack of quality options" |
| `desires` | What would they praise afterwards? | 4-5 star reviews (the sentence after "loved that...") | "recognised by name" | "great service" |
| `objections` | Why would they not buy from this brand, given what they know today? | 3-star reviews; questions in comments; the competitor notes ("the chain has an app"); prices on the site | "will they push cosmetic work on me" | "price" (which price, against what?) |
| `triggers` | What event makes them buy now rather than later? | reviews that say when ("after my boiler went", "before the wedding"); the calendar of the category | "the six-month reminder letter" | "when they need it" |
| `language` | What exact words do they use for the problem and the praise? | reviews, forums, comments, verbatim, 4-15 words, with a URL | { phrase: "explained every cost before doing anything", source: <url> } | a paraphrase; a quote with source "general" or "typical customer" |
| `platforms` | Where does this segment see a small business like this one? | brand kit, competitor notes, `platforms-by-segment.md` | one or two values | all four |
| `contentThatLands` | What post, concretely, answers one item above? | derived, one per pain, desire or objection | "the price list read aloud by the dentist: answers 'price before the chair'" | "behind the scenes", "tips and tricks" |
| `basis` | Did read sources fill at least two lists and two phrases? | count the sources | `evidence` | `evidence` claimed for a segment built from the owner's description alone |

## Situation prompts for Step 1

Answer these from `offer`, the services page and the reviews. Each answer is a candidate situation.

- When does someone first search for this? What has just happened?
- What are they doing ten minutes before they buy (commuting, in pain, planning a weekend, filing a tax return)?
- Who else is in the decision (a partner, a landlord, a boss, a child)?
- What did they try before (the chain, the supermarket, ignoring it, a cheaper option)?
- What would make them say "never again" about a competitor?
- What is the highest-value version of this purchase and who makes it?

## Evidence vs hypothesis: the counting rule

1. For each of `pains`, `desires`, `objections`, `triggers`, mark each item "read" (a URL, or the questionnaire) or "reasoned".
2. A list counts as sourced when at least one item is read.
3. `basis` is `evidence` when 2+ lists are sourced and `language` has 2+ phrases with URLs. Otherwise `hypothesis`.
4. The owner's questionnaire counts as a read source for pains and desires (they hear customers daily), not for `language` (they are not the customer) and not for `objections` (owners rarely hear why people did not buy).
5. Competitor reviews count as read sources for a segment when the situation is the same; say so in the source.

## Picking the primary segment

In order, stop at the first that decides it:

1. The brief's `priorityOffers`: the segment that buys them.
2. The brief's `bottleneck`: `repeat` and `orderValue` point to the segment that already buys; `awareness`, `trust` and `conversion` point to the segment the brand is not yet reaching but can serve at its price.
3. Questionnaire `orderValue` and `bestSellers`: the segment that buys the best seller at that value.
4. Questionnaire `idealCustomer`, if it matches a segment the reviews support.
5. When none decides, pick the segment with the most sourced items and write "primary by evidence available, revenue share unconfirmed" in `summary`.

## Merging and splitting

- Merge when two segments share the main pain, the main objection and the content angles, even if they differ in age or area.
- Split when one segment has two triggers that need opposite posts (an emergency buyer and a planner for the same trade).
- Never split by platform. A segment that reads on two platforms is one segment with two platforms.
