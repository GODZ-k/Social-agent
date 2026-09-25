# Finding competitors: search recipes by business type

As of 2026-09. `web-search` is Firecrawl `/v2/search` (limit 5 per call, returns `url`, `title`, `description`); there is no local map pack in the results, so local competitors are found through the queries a customer would type plus directory pages. Budget for this skill: 3 searches, 4 reads, out of the run's 8 and 12.

## Order of work

1. Verify the owner's names first (one search each, "<name> <town>"). Stop searching for them once the URL is found.
2. One discovery search in the customer's words. Read the result titles and descriptions before spending a page read; often the snippet gives the positioning line and the price band.
3. A second discovery search only when the first returned listicles or directories rather than businesses. Use it to open the best directory page (one read) and take names from it.

## Recipes

| Business type | Query the customer types | What to trust in the results | What to skip |
|---|---|---|---|
| Local walk-in (café, restaurant, bakery, shop, salon) | "<category> <neighbourhood>", "best <category> <town>", "<category> near <landmark>" | the businesses' own sites; a directory page (Google Maps listing, Tripadvisor, Yelp) as a name source | national listicles ("50 best cafés in the country"); delivery aggregators unless the brand sells there |
| Booking service (dentist, clinic, physio, studio, tutor) | "<service> <town>", "<treatment> cost <town>", "emergency <service> <town>" | the practices' own sites (services page, prices); NHS or regulator directories for existence only | comparison sites that sell leads; national chains outside the catchment |
| Enquiry trade (plumber, electrician, roofer, landscaper, cleaner) | "emergency <trade> <town>", "<job> <town>" ("boiler repair <town>"), "<trade> near me <town>" | the trades' own sites; trade-directory pages (Checkatrade, Rated People, Trustpilot) as name and review-count sources | lead-generation sites posing as businesses ("find a plumber now") |
| Online shop (D2C) | "<product as the customer says it>", "<product> review", "best <product> for <situation>", "buy <product> uk" | the brands that appear twice across results; marketplace pages only to see the price band | affiliate listicles as anything more than a name source; the marketplace itself is a channel, not a competitor |
| Subscription or membership (gym, box, course) | "<category> <town> membership", "<category> price <town>", "<category> for beginners <town>" | the businesses' own pricing pages | aggregators (ClassPass-style) unless the owner named them |
| B2B service (agency, consultant, software for a niche) | "<service> for <customer type>", "<service> agency <city>", "<problem the service solves>" | whoever appears for the customer's search, even if it is a different kind of business; their positioning line is on the home page | large generalists unless they appear for the same query |

## Reading the results before reading a page

- A description that contains a price or a "from" figure gives the price band without a read.
- A title that is a listicle ("10 best...") is a name source: read it once, take 3-5 names, and do not cite it as a competitor.
- Two results for the same domain (home page and a services page) mean the site is well indexed; read the home page only.
- A result whose description reads like an advert for the searcher ("Get 3 quotes now") is a lead-generation site; skip it.

## Deciding the catchment

- Walk-in: the neighbourhood or the town, 10-15 minutes' travel. A competitor across the city is not one.
- Booking service: the town or the nearest few; people travel 20-30 minutes for a dentist they trust.
- Trade: the radius the site says it covers; when it says nothing, the town and the neighbouring ones.
- Online: no geography; the channel is the catchment (the same marketplaces, the same search results, the same price band).

## When the search finds nothing usable

Say so in `opening` ("no local competitor appeared for the customer's search; the alternatives are <substitute> and doing nothing") and put the question to the owner in `openQuestions`. Do not fill `competitors[]` with businesses from another town to reach three.
