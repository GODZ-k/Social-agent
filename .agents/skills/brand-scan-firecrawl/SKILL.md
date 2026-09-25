---
name: brand-scan-firecrawl
description: "How this repo's brand scan uses Firecrawl and what we learned about the API that the docs do not say. Use when touching apps/api/src/scan, the brand-scan workflow, Firecrawl formats/errors/rate limits, or when verifying a scan on the test sites."
metadata:
  author: social_agent
  version: "1.0.0"
  updated: 2026-09-22
---

# Brand scan on Firecrawl

Load `firecrawl-build-scrape` for the general API. This skill holds what is specific to this repo and the facts we verified by probing the API on 2026-09-22.

## Where things are

| What | Where |
|---|---|
| The only file that sends a user-typed address anywhere | `apps/api/src/scan/firecrawl.ts` (`vetAddress` then one POST to `/v2/scrape`; also the only caller of `/v2/search`, see "Search") |
| Page picking, fact extraction (JSON-LD, tel/mailto, socials, logo) | `apps/api/src/scan/discover-pages.ts`, `extract-facts.ts` — run on Firecrawl's `rawHtml`, no Firecrawl knowledge inside |
| Colours and fonts from Firecrawl's `branding` | `apps/api/src/scan/extract-style.ts` |
| The one LLM call | `apps/api/src/mastra/workflows/brand-scan/steps/interpret.ts` (Brand Analyst agent) |
| Terminal command | `pnpm --filter api run scan -- <url> [--fetch \| --facts]` (`--facts` = everything except the AI step) |
| Key | `FIRECRAWL_API_KEY` in `apps/api/.env`; empty = keyless |

Request we send: `formats: ["rawHtml", "links"]` for every page, plus `"branding"` for the home page only; `onlyMainContent: false` (the footer holds the socials and `mailto:` links); `timeout` in ms (accepted by the API).

## Facts the docs do not state (all verified)

- **Firecrawl does not refuse private addresses.** Asked for `http://127.0.0.1:8080/` it fetched it on its own network and returned `statusCode: 404`. Our `vetAddress` (protocol, credentials, port 80/443, IP literal, DNS answers, internal names) runs before every call, inner pages included. Redirects are followed on Firecrawl's side; the post-redirect `metadata.url` is validated with `URL.canParse` before use.
- **Keyless calls work** but are capped per IP per day (~60 requests hit it once). A free key: 1,000 credits/month, **10 requests/minute** — a scan is up to 7 requests, so about one scan a minute. Hobby ($16/month): 5,000 credits, 100/minute. A scrape with `branding` is still 1 credit.
- **A PDF with `branding` requested** answers HTTP 500 `{"code":"SCRAPE_BRANDING_NOT_SUPPORTED"}`. Without branding the same PDF answers 200 with a 24-character `rawHtml`. We map the code to `NOT_A_WEBSITE` and treat `rawHtml` under 200 characters the same way.
- **A missing page** answers 200 at the API level with `data.metadata.statusCode: 404` — always read the inner status.
- **A malformed URL** answers HTTP 400 `success: false`.
- `branding.typography.fontFamilies` is junk (`Arial`, `Times New Roman` on real sites). `branding.typography.fontStacks.heading/body` are the real CSS stacks: take the first family that is not a system font, else fall back to Google Fonts `<link>`s and `@font-face` names in the HTML.
- `branding.colors` roles: `primary`, `secondary`, `accent`, `link`, `background`, `textPrimary`. We keep the first four, drop grey/near-white/near-black, dedupe, max 5. **`secondary` varies between runs** on pages with rotating hero sections (meowmeowtweet.com gave `#859CFF`, `#9CE2DA`, nothing, on three runs). `primary`, `accent`, `link` were stable.
- Firecrawl **reuses recently indexed content** unless `maxAge` is set; `metadata.cacheState`/`cachedAt` say what you got. We do not set `maxAge` today; a brand scan tolerates a copy a day or two old.
- Rendering takes 2–10 s per page; a whole scan lands at 20–50 s (fetch ≈ 15–30 s in parallel, model ≈ 7–18 s). `SCAN_BUDGET_MS` (45 s) covers fetching only.
- Also returned and unused today: `branding.images.logo/favicon/ogImage`, `personality`, button styles, `brandName`.

## Search (`/v2/search`, probed 2026-09-22)

Used by the research tools (`apps/api/src/mastra/tools/web-search.ts`) through `searchWeb` in `firecrawl.ts`. We send `{ query, limit, sources: ["web"], timeout }` with the same headers as scrape.

- **Success shape** (HTTP 200): `{"success":true,"data":{"web":[{"url","title","description","position"}]},"creditsUsed":2,"id":"<uuid>"}`. v2 groups results by source; with `sources: ["web"]` only `data.web` is present. `limit: 3` gave 3 hits, `limit: 5` gave 5.
- **Cost:** `creditsUsed: 2` per search whatever the `limit` (3 and 5 both cost 2). The 10 requests/minute cap on the free key counts searches too.
- **Bad body** (HTTP 400): `{"success":false,"error":"Invalid request body","details":[{"code":"invalid_type","path":["query"],"message":"Invalid input: expected string, received undefined"}]}`. `limit: 0` is refused the same way (`too_small`); `limit: 99` is accepted, so we clamp 1–5 ourselves.
- **Keyless** (HTTP 403): `{"success":false,"error":"Unfortunately, your IP address looks suspicious, so Firecrawl can't be used without an API key from here. ..."}` from this network; search is not usable keyless here.
- Results are ranked pages from the open web (Reddit, Yelp, Instagram, Wikipedia, the business's own site). **Nothing in a result is vetted or fetched**; a page is only read through `readMainText` → `fetchPage` → `vetAddress`, and its text is data for the model, never instructions.
- `classifyResponse` is shared with scrape: 401/402/429/5xx become a plain `Error` (our account or an outage), anything else that is not `success: true` is a `ScanError("SITE_UNREACHABLE")`, which the tool turns into a note.
- **Reading a search hit is not guaranteed.** `m.yelp.com/biz/...` (hit #2 for "four barrel coffee reviews") answers Firecrawl with an inner status of 400+ → `SITE_UNREACHABLE` → `read-page` says "Could not read this page." and spends the read. Reddit, Condé Nast Traveler and the business's own site read fine.
- **`readMainText` falls back** to the whole readable body (scripts, styles, svg, iframes removed; menus and footer kept) when the scan's extractor leaves under 300 characters: fourbarrelcoffee.com's home page is image-led and its `<main>` holds 88 characters ("shop all coffee … 1 / of 5"); the body gives 2,299 characters of menu and footer, which is the offer structure. No second Firecrawl request.

## Test sites and expected results

| Site | Why it is in the set | Expect from `--facts` |
|---|---|---|
| donangie.com | phone + address nested in JSON-LD (`subOrganization`); also a `Review.itemReviewed` business that must NOT leak | `#971B2F`, `#3A3E4D`, `#DAA520`; Courier Prime Sans; `(212) 889-8884`; `103 Greenwich Ave`; facebook + instagram |
| tartinebakery.com | JavaScript-only; `NO_CONTENT` without a renderer | `ok: true`; `#973A31`, `#C87E1E`; PitchSans; 3 emails; facebook + instagram |
| fourbarrelcoffee.com | Shopify; emails on the contact page | `#FF0000`, `#136F99`, `#1990C6`; Oswald; `info@fourbarrelcoffee.com` |
| meowmeowtweet.com | Shopify; Google Fonts + `@font-face`; rotating hero | `#FF9570`, `#D3F015` (+ a varying secondary); Source Serif Pro; `hello@meowmeowtweet.com`; instagram + tiktok |

Safety rows: `localhost`, `http://10.0.0.1/`, `http://169.254.169.254/`, `https://example.com:8443/` → `BLOCKED_ADDRESS`; `not a url` → `INVALID_URL`; a `.pdf` → `NOT_A_WEBSITE`; a dead hostname or a 404 page → `SITE_UNREACHABLE`.

## Rules when changing the scan

- Never fetch a user-supplied URL outside `firecrawl.ts`.
- Code, not the model, owns phone/email/address/hours/hex/fonts; the model's schema has no field for them.
- A refactor is verified by identical `--facts` output on the four sites (or on saved HTML fixtures when the rate limit is hit), not by tests — the owner has no test suite by choice.
- Keep the error codes to the six in `apps/api/src/scan/types.ts`; messages are plain words for a business owner.
