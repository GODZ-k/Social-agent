# Brand Scan on Firecrawl Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The brand scan reads websites through Firecrawl (rendered HTML + branding in one call) instead of our own HTTP client and CSS parser, so JS-only sites work and ~400 lines of the hardest code go away, while every fact (phone, address, hours, emails, socials, logo, text) is still extracted by our code.

**Architecture:** `src/scan/firecrawl.ts` becomes the only file that reads a website: it vets the address (Firecrawl does NOT block private addresses, verified 2026-09-22), POSTs to `https://api.firecrawl.dev/v2/scrape` and returns `{ url, html, links, branding? }`. `discover-pages.ts` and `extract-facts.ts` keep working on the returned HTML unchanged. `extract-style.ts` is rewritten to map Firecrawl's `branding` (colours + font stacks) plus font names found in the HTML into our `StyleFacts`. `index.ts`, the workflow steps and the `scan` command are rewired; `fetch-page.ts` is deleted.

**Tech Stack:** Node 24 global `fetch`, Firecrawl v2 scrape API (keyless in development, `FIRECRAWL_API_KEY` in production), cheerio, zod 4, `@mastra/core` 1.66 (unchanged).

**Spec:** `docs/superpowers/specs/2026-09-20-brand-scan-agent-design.md` plus the previous plan `docs/superpowers/plans/2026-09-21-brand-scan-agent.md`. This plan REPLACES the previous plan's Task 2 (fetch), Task 5 (style), and the fetch-related parts of Task 7. Everything else from the previous plan stands and is already built (see the ledger `.superpowers/sdd/2026-09-21-brand-scan-agent/progress.md`).

**Decision record (2026-09-22):** the owner reversed the 2026-09-20 decision "own fetch, no crawling service" after a spike on the four test sites. Findings: Firecrawl renders JS-only sites (tartinebakery.com went from `NO_CONTENT` to a full result), returns colours as good as ours (donangie identical; the same Shopify checkout-blue noise on Shopify sites; one dubious `#FF0000` on fourbarrelcoffee), keeps JSON-LD and `mailto:`/social links in `rawHtml`/`links`, but returns generic fallbacks as font names (`Arial`, `Times New Roman`) unless its `typography.fontStacks` are post-processed. Keyless calls work; Firecrawl fetched `http://127.0.0.1:8080/` when asked, so address vetting stays ours. A PDF comes back as `rawHtml` of 24 characters with `statusCode: 200`; a missing page comes back with `statusCode: 404`; a malformed URL is HTTP 400 `success:false`; the `timeout` request field is accepted.

## Global Constraints

- **No automated tests** (owner's decision). Every task ends with a real run whose output is checked against the expected output written in the task.
- **No git commits, no `git add`.** The owner reviews and commits. Never touch the git index.
- All paths are relative to the repo root. All code is under `apps/api`.
- `src/scan/*` never imports from `@mastra/*` or from `src/mastra`.
- **Only `src/scan/firecrawl.ts` may send a user-typed address anywhere.** No other file calls `fetch` with a URL that came from a person.
- No HTTP endpoint is added, so the Postman collection does not change.
- Error messages are for a business owner: plain words, no jargon. Error codes stay exactly the six in `src/scan/types.ts`.
- Scan limits: at most 7 pages per scan (home + 6), about 45 seconds per scan (`SCAN_BUDGET_MS`), 30 seconds per page render, 2,000,000 characters of HTML per page, ports 80/443 only, fewer than 80 words ends in `NO_CONTENT`. Stylesheets are no longer downloaded.
- **Clean code (owner's request 2026-09-21):** small named functions, one level of abstraction per function, no nested ternaries, descriptive names over clever regex one-liners, comments only where the *why* is not obvious. Match the style of the existing files in `apps/api/src`.
- Run scripts with `pnpm --filter api run <script>`. Typecheck with `pnpm --filter api run check-types`.
- Firecrawl rate limits: keyless is capped per IP per day (undocumented number); a free key allows 10 requests/minute (about one scan per minute, since a scan is up to 7 requests); Hobby ($16/month) allows 100/minute. Verification runs in this plan use at most 8 full scans and about 30 `--facts`/`--fetch` requests in total; spread them out if Firecrawl answers 429.

## File map

| File | Responsibility | Task |
|---|---|---|
| `apps/api/src/scan/firecrawl.ts` (new) | Address vetting + the one Firecrawl call. Exports `vetAddress`, `fetchPage`, types `FetchedPage`, `Branding` | 1 |
| `apps/api/src/scan/fetch-page.ts` (delete) | Replaced by `firecrawl.ts` | 1 |
| `apps/api/src/scan/address-check.ts` (keep, unchanged) | `isBlockedAddress(ip)` used by `vetAddress` | — |
| `apps/api/.env.example` | Add `FIRECRAWL_API_KEY=""` | 1 |
| `apps/api/scripts/scan.ts` | `--fetch` uses `fetchPage`; `--facts` and the full scan unchanged in behaviour | 1 |
| `apps/api/src/scan/types.ts` | Remove `styleSourceSchema`/`StyleSource`; `Discovery` carries `style` + `styleWarnings` instead of `styleSource` | 2 |
| `apps/api/src/scan/extract-style.ts` (rewrite) | `buildStyleFacts(branding, html)` → `{ style, warnings }` | 2 |
| `apps/api/src/scan/index.ts` | `discoverSite` and `readSite` on `fetchPage`; no stylesheets | 3 |
| `apps/api/src/mastra/workflows/brand-scan/steps/discover.ts`, `read-pages.ts` | Description strings only | 3 |
| `apps/api/src/mastra/workflows/brand-scan/run.ts` | One comment | 3 |
| `apps/api/AGENTS.md`, `apps/api/src/mastra/tools/README.md`, `apps/api/src/mastra/workflows/brand-scan/README.md`, `apps/api/src/mastra/README.md`, the spec | Docs say Firecrawl, not `fetch-page.ts` | 3 |

Tasks 1 and 2 touch disjoint files and can run in parallel. Task 3 needs both. Task 4 is the final review of the whole branch.

---

### Task 1: Firecrawl client

**Files:**
- Create: `apps/api/src/scan/firecrawl.ts`
- Delete: `apps/api/src/scan/fetch-page.ts`
- Modify: `apps/api/.env.example`
- Modify: `apps/api/scripts/scan.ts:9-33`

**Interfaces:**
- Consumes: `isBlockedAddress(address: string): boolean` from `./address-check`; `ScanError` from `./types`.
- Produces: `vetAddress(rawUrl: string): Promise<URL>`; `fetchPage(rawUrl: string, options: { deadline: number; withBranding?: boolean }): Promise<FetchedPage>`; `type FetchedPage = { url: string; html: string; links: string[]; branding?: Branding }`; `type Branding = { colors?: Partial<Record<"primary" | "secondary" | "accent" | "link" | "background" | "textPrimary", string>>; typography?: { fontStacks?: { heading?: string[]; body?: string[] } } }`.

- [ ] **Step 1: Write `apps/api/src/scan/firecrawl.ts`**

```ts
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { isBlockedAddress } from "./address-check";
import { ScanError } from "./types";

// The only file that reads a website. Firecrawl opens the page in a real browser on its own
// servers and returns the rendered HTML, every link on the page and, when asked, the site's
// colours and fonts. Our server never connects to a user-typed address.
//
// Firecrawl does not refuse private addresses (checked 2026-09-22: it fetched 127.0.0.1:8080),
// so vetAddress runs before every call. Without FIRECRAWL_API_KEY the calls are keyless, which
// Firecrawl caps per IP per day: enough for development, not for production.

const FIRECRAWL_SCRAPE_URL = "https://api.firecrawl.dev/v2/scrape";
const RENDER_TIMEOUT_MS = 30_000; // a browser render of one page takes 2-10 s
const MAX_HTML_CHARS = 2_000_000;
// A PDF or an image comes back as a stub document around the extracted text, not as a web page.
const MIN_WEBPAGE_CHARS = 200;

export type Branding = {
  colors?: Partial<Record<"primary" | "secondary" | "accent" | "link" | "background" | "textPrimary", string>>;
  typography?: { fontStacks?: { heading?: string[]; body?: string[] } };
};

export type FetchedPage = {
  /** The address after redirects. */
  url: string;
  html: string;
  links: string[];
  branding?: Branding;
};

type FirecrawlResponse = {
  success?: boolean;
  error?: string;
  data?: {
    rawHtml?: string;
    links?: string[];
    branding?: Branding;
    metadata?: { url?: string; statusCode?: number };
  };
};

const INTERNAL_NAME_SUFFIX = /\.(localhost|local|internal|home|lan|arpa)$/i;

function parseUrl(rawUrl: string): URL {
  try {
    return new URL(rawUrl);
  } catch {
    throw new ScanError("INVALID_URL");
  }
}

function assertPublicWebPort(url: URL): void {
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new ScanError("BLOCKED_ADDRESS");
  if (url.username || url.password) throw new ScanError("BLOCKED_ADDRESS");
  if (url.port !== "" && url.port !== "80" && url.port !== "443") throw new ScanError("BLOCKED_ADDRESS");
}

async function assertPublicHost(hostname: string): Promise<void> {
  const host = hostname.replace(/^\[|\]$/g, ""); // "[::1]" -> "::1"
  if (isIP(host) !== 0) {
    if (isBlockedAddress(host)) throw new ScanError("BLOCKED_ADDRESS");
    return;
  }
  if (!host.includes(".") || INTERNAL_NAME_SUFFIX.test(host)) throw new ScanError("BLOCKED_ADDRESS");

  let addresses: { address: string }[];
  try {
    addresses = await lookup(host, { all: true });
  } catch {
    throw new ScanError("SITE_UNREACHABLE");
  }
  if (addresses.length === 0 || addresses.some((entry) => isBlockedAddress(entry.address))) {
    throw new ScanError("BLOCKED_ADDRESS");
  }
}

/** Turns away anything that is not a public website before a Firecrawl request is spent on it. */
export async function vetAddress(rawUrl: string): Promise<URL> {
  const url = parseUrl(rawUrl);
  assertPublicWebPort(url);
  await assertPublicHost(url.hostname);
  return url;
}

function requestHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  return headers;
}

async function callFirecrawl(url: URL, formats: string[], timeoutMs: number): Promise<FirecrawlResponse> {
  let response: Response;
  try {
    response = await fetch(FIRECRAWL_SCRAPE_URL, {
      method: "POST",
      headers: requestHeaders(),
      body: JSON.stringify({ url: url.href, formats, onlyMainContent: false, timeout: timeoutMs }),
      signal: AbortSignal.timeout(timeoutMs + 5_000),
    });
  } catch {
    throw new ScanError("SITE_UNREACHABLE"); // network error, or our own timeout fired
  }

  // Our account or Firecrawl itself is the problem, not the website: surface it to the API's
  // error handling instead of telling the business owner their site is unreachable.
  const accountOrOutage = response.status === 401 || response.status === 402 || response.status === 429 || response.status >= 500;
  if (accountOrOutage) {
    const detail = (await response.text()).slice(0, 200);
    throw new Error(`Firecrawl answered ${response.status}: ${detail}`);
  }

  const body = (await response.json().catch(() => ({}))) as FirecrawlResponse;
  if (!response.ok || !body.success || !body.data) throw new ScanError("SITE_UNREACHABLE");
  return body;
}

/**
 * One rendered page. Branding is only needed for the home page. Throws ScanError for anything
 * that is the website's fault (or the address's); a Firecrawl account or outage problem is
 * thrown as a plain Error.
 */
export async function fetchPage(rawUrl: string, options: { deadline: number; withBranding?: boolean }): Promise<FetchedPage> {
  const url = await vetAddress(rawUrl);

  const remainingMs = options.deadline - Date.now();
  if (remainingMs <= 0) throw new ScanError("SITE_UNREACHABLE");
  const timeoutMs = Math.min(RENDER_TIMEOUT_MS, remainingMs);

  const formats = options.withBranding ? ["rawHtml", "links", "branding"] : ["rawHtml", "links"];
  const { data } = await callFirecrawl(url, formats, timeoutMs);
  if (!data) throw new ScanError("SITE_UNREACHABLE");

  const status = data.metadata?.statusCode ?? 200;
  if (status >= 400) throw new ScanError("SITE_UNREACHABLE");

  const html = data.rawHtml ?? "";
  if (html.length < MIN_WEBPAGE_CHARS) throw new ScanError("NOT_A_WEBSITE");

  return {
    url: data.metadata?.url || url.href,
    html: html.slice(0, MAX_HTML_CHARS),
    links: data.links ?? [],
    branding: data.branding,
  };
}
```

- [ ] **Step 2: Delete `apps/api/src/scan/fetch-page.ts`**

Delete the file (`Remove-Item apps/api/src/scan/fetch-page.ts` in PowerShell, or `rm`). Do not use `git rm`.

- [ ] **Step 3: Add the key to `apps/api/.env.example`**

Append after the `OPENAI_API_KEY=""` line:

```
# Brand scan. Empty = keyless Firecrawl calls (rate-limited per IP, fine for development).
FIRECRAWL_API_KEY=""
```

- [ ] **Step 4: Update `apps/api/scripts/scan.ts`**

Replace the header comment lines 1-6 and the imports and the `--fetch` branch so the file's top reads:

```ts
// Terminal command for the brand scan:  pnpm --filter api run scan -- <url> [--fetch | --facts]
//   (no flag)  the full scan: prints each step as it starts, then the outcome as JSON
//   --fetch    read the home page through Firecrawl and print what came back (no parsing, no AI)
//   --facts    run the whole scan except the AI step and print what code extracted
// --fetch and --facts need no database. The full scan needs ANTHROPIC_API_KEY and DATABASE_URL
// in apps/api/.env (Mastra stores workflow runs in Postgres). FIRECRAWL_API_KEY is optional.
import "dotenv/config";
import { websiteUrlSchema } from "@social-agent/shared";
import { fetchPage } from "../src/scan/firecrawl";
import { SCAN_BUDGET_MS, discoverSite, readSite } from "../src/scan/index";
import { ScanError } from "../src/scan/types";
```

and the `--fetch` branch becomes:

```ts
    if (flags.has("--fetch")) {
      const page = await fetchPage(url, { deadline: Date.now() + SCAN_BUDGET_MS, withBranding: true });
      print({ ok: true, url: page.url, htmlChars: page.html.length, links: page.links.length, branding: page.branding });
      return 0;
    }
```

Everything else in the file stays as it is. (Until Task 3 lands, `check-types` will report errors in `src/scan/index.ts` because it still imports `fetch-page` and `extractStyleSource`: expected. Task 1's own check is Step 5.)

- [ ] **Step 5: Typecheck this file alone**

Run: `pnpm --filter api exec tsc --noEmit --skipLibCheck src/scan/firecrawl.ts scripts/scan.ts` — if that command form fails on this TS version, run `pnpm --filter api run check-types` and confirm the ONLY errors are in `src/scan/index.ts` (imports of `./fetch-page` and `extractStyleSource`).
Expected: no error mentions `firecrawl.ts` or `scripts/scan.ts`.

- [ ] **Step 6: Verify against real addresses**

`--fetch` goes through `scripts/scan.ts` → `fetchPage`. Run each and compare:

| Command | Expected |
|---|---|
| `pnpm --filter api run scan -- donangie.com --fetch` | `ok: true`, `url: "https://www.donangie.com/"`, `htmlChars` around 90,000, `links` > 10, `branding.colors.primary` is `#971B2F` |
| `pnpm --filter api run scan -- tartinebakery.com --fetch` | `ok: true`, `htmlChars` > 100,000, `branding.typography.fontStacks.heading` contains `"PitchSans"` |
| `pnpm --filter api run scan -- localhost --fetch` | `{ ok: false, code: "BLOCKED_ADDRESS" }` |
| `pnpm --filter api run scan -- http://127.0.0.1:8080/ --fetch` | `BLOCKED_ADDRESS` |
| `pnpm --filter api run scan -- http://10.0.0.1/ --fetch` | `BLOCKED_ADDRESS` |
| `pnpm --filter api run scan -- http://[::1]/ --fetch` | `BLOCKED_ADDRESS` |
| `pnpm --filter api run scan -- https://example.com:8443/ --fetch` | `BLOCKED_ADDRESS` |
| `pnpm --filter api run scan -- https://user:pw@example.com/ --fetch` | `BLOCKED_ADDRESS` |
| `pnpm --filter api run scan -- ftp://example.com/ --fetch` | `BLOCKED_ADDRESS` |
| `pnpm --filter api run scan -- https://donangie.com/this-page-does-not-exist-xyz --fetch` | `SITE_UNREACHABLE` (Firecrawl reports `statusCode: 404`) |
| `pnpm --filter api run scan -- https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf --fetch` | `NOT_A_WEBSITE` (Firecrawl returns a 24-character `rawHtml`) |
| `pnpm --filter api run scan -- https://this-host-does-not-exist-kjhgf.com/ --fetch` | `SITE_UNREACHABLE` (DNS lookup fails in `assertPublicHost`) |

Note: `scan.ts` prefixes `https://` to a bare host, so `localhost` becomes `https://localhost/` and is blocked by the "no dot" rule.

Write the actual outputs (trimmed) into the task report. If any row differs, fix `firecrawl.ts` and rerun that row; report any Firecrawl behaviour that differs from the decision record above.

---

### Task 2: Style facts from Firecrawl branding

**Files:**
- Modify: `apps/api/src/scan/types.ts:81-115`
- Rewrite: `apps/api/src/scan/extract-style.ts`

**Interfaces:**
- Consumes: `Branding` from `./firecrawl` (Task 1; if that file does not exist yet when this task starts, declare the same type locally in `extract-style.ts` and switch the import when Task 1 lands — Task 3 checks the import), `StyleFacts` from `./types`.
- Produces: `buildStyleFacts(branding: Branding | undefined, html: string): { style: StyleFacts; warnings: string[] }`; `Discovery` now `{ url, home, style: StyleFacts, styleWarnings: string[], pageUrls }`.

- [ ] **Step 1: Update `apps/api/src/scan/types.ts`**

Delete lines 81-88 (`styleSourceSchema` and `StyleSource`). Replace `discoverySchema` with:

```ts
export const discoverySchema = z.object({
  /** The home page's address after redirects. */
  url: z.string(),
  home: pageFactsSchema,
  /** Colours and fonts come with the home page, so they are settled before the inner pages are read. */
  style: styleFactsSchema,
  styleWarnings: z.array(z.string()),
  pageUrls: z.array(z.string()),
});
export type Discovery = z.infer<typeof discoverySchema>;
```

`styleFactsSchema` (lines 90-95) stays as it is.

- [ ] **Step 2: Rewrite `apps/api/src/scan/extract-style.ts`**

Replace the whole file with:

```ts
import { load } from "cheerio";
import type { Branding } from "./firecrawl";
import type { StyleFacts } from "./types";

// Colours and fonts from Firecrawl's branding output, cleaned up to our rules. Code owns these
// facts: a colour is kept only when it is a valid 6-digit hex and is not grey, near-white or
// near-black; a font is kept only when it is a real choice, not a system fallback.

const MAX_COLORS = 5;
const COLOR_ROLES = ["primary", "secondary", "accent", "link"] as const; // most important first
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

// Fonts a browser or operating system supplies on its own. A stack that starts with these
// (Shopify's "system serif" preset, for example) tells us nothing about the brand.
const SYSTEM_FONTS = new Set([
  "serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui", "system_ui", "ui-serif", "ui-sans-serif",
  "ui-monospace", "ui-rounded", "-apple-system", "blinkmacsystemfont", "inherit", "initial", "unset", "revert",
  "emoji", "math", "arial", "helvetica", "helvetica neue", "times", "times new roman", "georgia", "verdana",
  "tahoma", "trebuchet ms", "segoe ui", "roboto", "noto sans", "liberation sans", "new york", "iowan old style",
  "apple garamond", "baskerville", "droid serif", "apple color emoji", "segoe ui emoji", "segoe ui symbol",
  "noto color emoji",
]);

type Lightness = { lightness: number; saturation: number };

function lightnessAndSaturation(hex: string): Lightness {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const saturation = max === min ? 0 : (max - min) / (1 - Math.abs(2 * lightness - 1));
  return { lightness, saturation };
}

function isBrandColor(hex: string): boolean {
  if (!HEX_COLOR.test(hex)) return false;
  const { lightness, saturation } = lightnessAndSaturation(hex);
  return lightness <= 0.92 && lightness >= 0.1 && saturation >= 0.12;
}

function brandColors(branding: Branding | undefined): string[] {
  const colors: string[] = [];
  for (const role of COLOR_ROLES) {
    const value = branding?.colors?.[role]?.trim();
    if (!value || !isBrandColor(value)) continue;
    const hex = value.toUpperCase();
    if (!colors.includes(hex)) colors.push(hex);
  }
  return colors.slice(0, MAX_COLORS);
}

const cleanFamily = (name: string) => name.trim().replace(/^["']|["']$/g, "").trim();
const isChosenFont = (name: string) => name !== "" && !SYSTEM_FONTS.has(name.toLowerCase());

function firstChosenFont(stack: string[] | undefined): string | undefined {
  return stack?.map(cleanFamily).find(isChosenFont);
}

/** Font names the page loads on purpose: Google Fonts links and @font-face rules, in page order. */
function loadedFontNames(html: string): string[] {
  const $ = load(html);
  const names: string[] = [];

  $('link[href*="fonts.googleapis.com"]').each((_, element) => {
    const href = $(element).attr("href") ?? "";
    let url: URL;
    try {
      url = new URL(href, "https://fonts.googleapis.com");
    } catch {
      return;
    }
    for (const family of url.searchParams.getAll("family")) {
      for (const entry of family.split("|")) names.push(entry.split(":")[0]!.replace(/\+/g, " "));
    }
  });

  const css = $("style").map((_, element) => $(element).text()).get().join("\n");
  for (const match of css.matchAll(/@font-face\s*{[^}]*font-family\s*:\s*([^;}]+)/gi)) names.push(match[1]!);

  return [...new Set(names.map(cleanFamily).filter(isChosenFont))];
}

function brandFonts(branding: Branding | undefined, html: string): { heading?: string; body?: string } {
  const stacks = branding?.typography?.fontStacks;
  let heading = firstChosenFont(stacks?.heading);
  let body = firstChosenFont(stacks?.body);
  if (heading && body) return { heading, body };

  const loaded = loadedFontNames(html);
  heading ??= loaded[0];
  body ??= loaded[1] ?? loaded[0];
  return { heading, body };
}

/** Ranked brand colours and the heading/body fonts, from Firecrawl's branding and the home page HTML. */
export function buildStyleFacts(branding: Branding | undefined, html: string): { style: StyleFacts; warnings: string[] } {
  const warnings: string[] = [];

  const colors = brandColors(branding);
  if (colors.length === 0) warnings.push("No brand colours were found in the website's styling.");

  const { heading, body } = brandFonts(branding, html);
  if (!heading && !body) warnings.push("No fonts were found in the website's styling.");
  const fonts = { heading: heading ?? body ?? "sans-serif", body: body ?? heading ?? "sans-serif" };

  return { style: { colors, fonts }, warnings };
}
```

- [ ] **Step 3: Check the expected results by hand against the spike data**

Trace the code above against these inputs (from the 2026-09-22 spike) and write the traced result in the task report:

| Site | Firecrawl `colors` | `fontStacks` | HTML fonts | Expected `style` |
|---|---|---|---|---|
| donangie | primary `#971B2F`, secondary `#3A3E4D`, accent `#DAA520`, link `#DAA520` | heading `["Courier Prime Sans"]`, body `["Courier Prime Sans"]` | — | colors `["#971B2F", "#3A3E4D", "#DAA520"]` (`#3A3E4D`: lightness 0.265, saturation 0.14 → just above the 0.12 grey line, kept; `#DAA520` appears once, deduped); fonts Courier Prime Sans / Courier Prime Sans |
| fourbarrel | primary `#FF0000`, secondary `#136F99`, accent `#1990C6`, link `#1990C6` | heading `["Oswald","sans-serif"]`, body `["system_ui","-apple-system",…,"Arial","sans-serif",…]` | `@font-face` Oswald | colors `["#FF0000", "#136F99", "#1990C6"]`; heading Oswald, body Oswald (stack has no chosen font → `loaded[1] ?? loaded[0]` = Oswald) |
| meowmeowtweet | primary `#FF9570`, secondary `#859CFF`, accent `#D3F015`, link `#D3F015` | heading and body `["New York","Iowan Old Style","Apple Garamond","Baskerville","Times New Roman","Droid Serif","Times","Source Serif Pro","serif",…]` | Google Fonts Poppins, Open Sans; `@font-face` Dover Serif Italic, Dover Serif Regular, FTBase | colors `["#FF9570", "#859CFF", "#D3F015"]`; heading Source Serif Pro, body Source Serif Pro |
| tartine | primary `#973A31`, accent `#C87E1E`, background `#FFFFFF`, textPrimary `#000000`, link `#C87E1E` | heading `["PitchSans"]`, body `["Times New Roman"]` | `@font-face` PitchSans | colors `["#973A31", "#C87E1E"]`; heading PitchSans, body PitchSans |

If your trace disagrees with a row, the table is wrong or the code is: say which, and fix the code only when it violates the rules in the file's header comment.

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter api run check-types`
Expected: the only errors are in `src/scan/index.ts` (it still uses `extractStyleSource`, `styleSource` and `fetchDocument` until Task 3). No error mentions `extract-style.ts` or `types.ts`.

---

### Task 3: Rewire the scan, docs, and verify end to end

**Files:**
- Rewrite: `apps/api/src/scan/index.ts`
- Modify: `apps/api/src/mastra/workflows/brand-scan/steps/discover.ts:8`, `read-pages.ts:8`
- Modify: `apps/api/src/mastra/workflows/brand-scan/run.ts:19-20`
- Modify: `apps/api/AGENTS.md:44`, `apps/api/src/mastra/tools/README.md:10`, `apps/api/src/mastra/workflows/brand-scan/README.md`, `apps/api/src/mastra/README.md`, `docs/superpowers/specs/2026-09-20-brand-scan-agent-design.md`

**Interfaces:**
- Consumes: `fetchPage`, `FetchedPage` (Task 1); `buildStyleFacts` and the new `Discovery` (Task 2); `pickPages(homeUrl, html)`, `extractPageFacts(url, html)` (unchanged).
- Produces: `discoverSite(url: string, deadline: number): Promise<Discovery>`; `readSite(discovery: Discovery, deadline: number): Promise<{ facts: SiteFacts; warnings: string[] }>`; `SCAN_BUDGET_MS` — same names the steps and `scripts/scan.ts` already import.

- [ ] **Step 1: Rewrite `apps/api/src/scan/index.ts`**

```ts
import type { BusinessInfo } from "@social-agent/shared";
import { pickPages } from "./discover-pages";
import { extractPageFacts } from "./extract-facts";
import { buildStyleFacts } from "./extract-style";
import { fetchPage, type FetchedPage } from "./firecrawl";
import { ScanError, type Discovery, type PageFacts, type SiteFacts } from "./types";

// The whole scan with no AI in it. Runs without a database: `scan -- <url> --facts`.

export const SCAN_BUDGET_MS = 45_000;
const MIN_WORDS = 80;

/** Step "discover": the home page with its branding, and which inner pages are worth reading. A failure here fails the scan. */
export async function discoverSite(url: string, deadline: number): Promise<Discovery> {
  const home = await fetchPage(url, { deadline, withBranding: true });
  const { style, warnings } = buildStyleFacts(home.branding, home.html);
  return {
    url: home.url,
    home: extractPageFacts(home.url, home.html),
    style,
    styleWarnings: warnings,
    pageUrls: pickPages(home.url, home.html),
  };
}

function siteNameCandidates(pages: PageFacts[]): string[] {
  const home = pages[0]!;
  const fromTitle = home.title.split(/\s+[|–—·:-]\s+/).map((part) => part.trim());
  const candidates = [home.og.siteName, ...pages.flatMap((page) => page.schemaNames), ...fromTitle];
  const usable = candidates.filter((name): name is string => Boolean(name) && name!.length <= 60);
  return [...new Set(usable)].slice(0, 5);
}

function collectPages(home: PageFacts, fetched: PromiseSettledResult<FetchedPage>[]): PageFacts[] {
  const pages = [home];
  for (const result of fetched) {
    if (result.status !== "fulfilled") continue;
    const alreadyRead = pages.some((page) => page.url === result.value.url); // two links, one page after redirects
    if (alreadyRead) continue;
    pages.push(extractPageFacts(result.value.url, result.value.html));
  }
  return pages;
}

function unreadPagesWarning(fetched: PromiseSettledResult<FetchedPage>[], deadline: number): string | undefined {
  const failed = fetched.filter((result) => result.status === "rejected").length;
  if (failed === 0) return undefined;
  const ranOut = Date.now() >= deadline ? " The scan ran out of time." : "";
  return `${failed} ${failed === 1 ? "page" : "pages"} could not be read.${ranOut}`;
}

function businessInfo(pages: PageFacts[]): BusinessInfo | undefined {
  const phone = pages.flatMap((page) => page.phones)[0];
  const email = pages.flatMap((page) => page.emails)[0];
  const location = pages.map((page) => page.location).find(Boolean);
  const hours = pages.map((page) => page.hours).find(Boolean);
  const info: BusinessInfo = {
    ...(phone ? { phone } : {}),
    ...(email ? { email } : {}),
    ...(location ? { location } : {}),
    ...(hours ? { hours } : {}),
  };
  return Object.keys(info).length > 0 ? info : undefined;
}

/** Step "read-pages": the inner pages in parallel, then one SiteFacts. */
export async function readSite(discovery: Discovery, deadline: number): Promise<{ facts: SiteFacts; warnings: string[] }> {
  const fetched = await Promise.allSettled(discovery.pageUrls.map((pageUrl) => fetchPage(pageUrl, { deadline })));
  const pages = collectPages(discovery.home, fetched);

  const warnings = [...discovery.styleWarnings];
  const unread = unreadPagesWarning(fetched, deadline);
  if (unread) warnings.push(unread);

  const words = pages.reduce((total, page) => total + page.wordCount, 0);
  if (words < MIN_WORDS) throw new ScanError("NO_CONTENT");

  return {
    facts: {
      url: discovery.url,
      nameCandidates: siteNameCandidates(pages),
      pages,
      style: discovery.style,
      business: businessInfo(pages),
      socialLinks: [...new Set(pages.flatMap((page) => page.socialLinks))],
      logo: pages.map((page) => page.logo).find(Boolean),
    },
    warnings,
  };
}
```

Note: an inner page that fails `vetAddress` (a link to a private host) is simply an unread page; only the home page's vetting fails the scan. A plain `Error` from Firecrawl (401/402/429/5xx) on an inner page is also swallowed into "could not be read" by `allSettled` — acceptable, because the home page call already proved the account works.

- [ ] **Step 2: Update the step descriptions and one comment**

`steps/discover.ts` line 8: `description: "Read the home page through Firecrawl, take its colours and fonts, and pick up to 6 useful internal pages.",`

`steps/read-pages.ts` line 8: `description: "Read the picked pages through Firecrawl and extract the facts from every page.",`

`run.ts` lines 19-20: replace `fetchDocument's checks` with `vetAddress's checks in src/scan/firecrawl.ts`.

- [ ] **Step 3: Typecheck and build**

Run: `pnpm --filter api run check-types` → Expected: no errors.
Run: `pnpm --filter api run build` → Expected: succeeds and `dist/skills/brand-voice/SKILL.md` exists (Task 8 of the previous plan).
Run: `pnpm --filter api run postman:check` → Expected: passes (no routes changed).
Run: `Select-String -Path apps/api/src/scan/*.ts -Pattern "mastra"` (or `grep -ri mastra apps/api/src/scan`) → Expected: no matches.
Run: `Select-String -Path apps/api/src -Recurse -Pattern "fetch-page|fetchDocument|extractStyleSource|styleSource"` → Expected: no matches in `.ts` files.

- [ ] **Step 4: Update the docs**

`apps/api/AGENTS.md` line 44, replace the sentence from "`src/scan` is plain code" to the end of the bullet with:

> `src/scan` is plain code with no Mastra import. Websites are read through Firecrawl (`src/scan/firecrawl.ts` is the only file allowed to send a user-typed address anywhere; it vets the address first because Firecrawl does not refuse private hosts). Never fetch a user-supplied URL any other way. `FIRECRAWL_API_KEY` is optional in development (keyless, rate-limited) and required in production.

`apps/api/src/mastra/tools/README.md` line 10: replace "through `src/scan/fetch-page.ts`" with "through `src/scan/firecrawl.ts`".

`apps/api/src/mastra/workflows/brand-scan/README.md` and `apps/api/src/mastra/README.md`: read both; wherever they describe fetching, stylesheets, `fetch-page.ts` or SSRF, rewrite that sentence to match this plan (Firecrawl renders the page; branding gives colours and fonts; no stylesheets are downloaded; the address check lives in `firecrawl.ts`). Change nothing else.

`docs/superpowers/specs/2026-09-20-brand-scan-agent-design.md`: add directly under the title:

> **Amendment 2026-09-22:** website fetching, JS rendering, and colour/font detection now go through Firecrawl (`src/scan/firecrawl.ts`); see `docs/superpowers/plans/2026-09-22-brand-scan-firecrawl.md` for the decision record. Address vetting, page picking, fact extraction, the workflow and the single LLM call are unchanged. The "own fetch, no crawling service" decision below is superseded.

- [ ] **Step 5: Verify `--facts` on the four sites**

Run `pnpm --filter api run scan -- <site> --facts` for each and compare with these expectations (from the 2026-09-22 spike and Task 2's trace). Record the actual `style`, `business`, `socialLinks`, page count and elapsed time in the report.

| Site | Expected |
|---|---|
| `fourbarrelcoffee.com` | `ok: true`; 4-5 pages; `style.colors` `["#FF0000","#136F99","#1990C6"]`; fonts Oswald/Oswald; `business.email` `info@fourbarrelcoffee.com` |
| `meowmeowtweet.com` | `ok: true`; 6-7 pages; colors `["#FF9570","#859CFF","#D3F015"]`; fonts Source Serif Pro / Source Serif Pro; `business.email` `hello@meowmeowtweet.com`; socials include instagram and tiktok |
| `donangie.com` | `ok: true`; 4-5 pages; colors `["#971B2F","#3A3E4D","#DAA520"]`; fonts Courier Prime Sans; `business.phone` `(212) 889-8884`; `location.address` `103 Greenwich Ave` |
| `tartinebakery.com` | **`ok: true`** (was `NO_CONTENT`); colors `["#973A31","#C87E1E"]`; fonts PitchSans; socials include facebook and instagram; `business.email` present |

Each `--facts` run is up to 7 Firecrawl requests. If a run answers `SITE_UNREACHABLE` for the home page with a `Firecrawl answered 429` error in the output, wait a minute and rerun.

- [ ] **Step 6: Verify the safety rows through the full path**

Run `pnpm --filter api run scan -- <input> --facts` for: `localhost`, `http://10.0.0.1/`, `http://169.254.169.254/latest/meta-data/`, `https://example.com:8443/`, `not a url`.
Expected: the first four print `{ ok: false, code: "BLOCKED_ADDRESS", ... }`; `not a url` prints `INVALID_URL` (`scan.ts` turns it into `https://not a url` which `new URL` rejects).

- [ ] **Step 7: Verify the full scan with the model (max 3 runs)**

Requires `ANTHROPIC_API_KEY` and `DATABASE_URL` in `apps/api/.env`. Run:

- `pnpm --filter api run scan -- donangie.com` → Expected: steps print in order `discover`, `read-pages`, `interpret`, `report`; `ok: true`; `result.brandKit.colors` (or the equivalent field in `scanResultSchema`) equals the `--facts` colours; `result.business.phone` is `(212) 889-8884`; done in under 45 s.
- `pnpm --filter api run scan -- tartinebakery.com` → Expected: `ok: true` with a tagline and voice words; this is the JS-only site that used to fail.
- `pnpm --filter api run scan -- localhost` → Expected: `{ ok: false, code: "BLOCKED_ADDRESS" }` with no model call (no `interpret` step printed).

Then the registration check from the previous plan's Task 7: run `pnpm --filter api exec tsx -e "import { mastra } from './src/mastra/index'; console.log(Object.keys(mastra.getWorkflows()), Object.keys(mastra.getAgents())); process.exit(0)"` → Expected: includes `brandScanWorkflow` and `brandAnalyst`.

Paste the trimmed outputs into the report.

---

### Task 4: Final whole-branch review

**Files:** read-only over every file changed on `backend` since `834c4ff` (`git diff --name-only 834c4ff` plus untracked files under `apps/api`).

- [ ] **Step 1: Dispatch one reviewer on the most capable model** with: this plan, the previous plan, the ledger's every `minor (deferred)` line that still applies (those about `fetch-page.ts` and `extract-style.ts` are moot), and the instruction to read every changed file. Focus list: `firecrawl.ts` error mapping and vetting; `extract-style.ts` rules; `index.ts`; the previously unreviewed Task 7 workflow files and Task 8 build wiring (`scripts/copy-skills.mjs`, tsup `onSuccess`, READMEs); prompt-injection handling in `agents/brand-analyst/prompt.ts`; the clean-code constraint.
- [ ] **Step 2: One fix wave** for Critical/Important findings, by a fresh implementer per file group.
- [ ] **Step 3: One scoped re-review**, then `check-types`, `build`, and one more `--facts` run on `donangie.com`.
- [ ] **Step 4: Final report to the owner** with every `Ruling:` line from the ledger, the spike numbers, and the list of deferred minors.
