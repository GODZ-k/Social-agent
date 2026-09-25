import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { load } from "cheerio";
import { config } from "@/config/constants";
import { isBlockedAddress } from "./address-check";
import { extractPageFacts } from "./extract-facts";
import { ScanError } from "./types";

// The only file that reads a website: Firecrawl renders the page on its own servers, so our
// server never connects to a user-typed address. Firecrawl does not refuse private addresses
// (checked 2026-09-22: it fetched 127.0.0.1:8080), so vetAddress runs before every call.

const NOT_READABLE_TAGS = "script, style, noscript, svg, template, iframe";
const BLOCK_TAGS = "p, div, li, br, h1, h2, h3, h4, h5, h6, td, th, section, article, nav, header, footer";
const NOT_A_WEBPAGE_CODE = "SCRAPE_BRANDING_NOT_SUPPORTED"; // Firecrawl's answer for a PDF or an image

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

/** One web search result as Firecrawl ranks it. Nothing here has been vetted or read. */
export type SearchHit = { url: string; title: string; description: string };

export type MainText = {
  /** The address after redirects. */
  url: string;
  title: string;
  /** Readable text of the page, at most config.firecrawl.MAX_MAIN_TEXT_CHARS, cut on a word boundary. */
  text: string;
};

type FirecrawlResponse = {
  success?: boolean;
  error?: string;
  code?: string;
  data?: {
    rawHtml?: string;
    links?: string[];
    branding?: Branding;
    metadata?: { url?: string; statusCode?: number };
    /** Search only: v2 groups results by kind; we ask for web pages alone. */
    web?: Partial<SearchHit>[];
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

function parseJson(text: string): FirecrawlResponse {
  try {
    return JSON.parse(text) as FirecrawlResponse;
  } catch {
    return {};
  }
}

async function postFirecrawl(endpoint: string, payload: Record<string, unknown>, timeoutMs: number): Promise<Response> {
  try {
    const headers = requestHeaders();
    const body = JSON.stringify({ ...payload, timeout: timeoutMs });
    const signal = AbortSignal.timeout(timeoutMs + config.firecrawl.ABORT_GRACE_MS);
    return await fetch(endpoint, { method: "POST", headers, body, signal });
  } catch {
    throw new ScanError("SITE_UNREACHABLE"); // network error, or our own timeout fired
  }
}

async function readBody(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    throw new ScanError("SITE_UNREACHABLE"); // the body did not finish arriving
  }
}

/** Our account or Firecrawl itself is the problem, not the website the owner typed. */
function isAccountOrOutage(status: number): boolean {
  return status === 401 || status === 402 || status === 429 || status >= 500;
}

const isSuccessStatus = (status: number) => status >= 200 && status < 300;

/** The body, or the error to throw for it. Order matters: the three taxonomies overlap. */
function classifyResponse(status: number, body: FirecrawlResponse, text: string): FirecrawlResponse | Error {
  if (body.code === NOT_A_WEBPAGE_CODE) return new ScanError("NOT_A_WEBSITE");
  // A plain Error so the API's error handling sees it, rather than the owner being told their
  // site is unreachable.
  if (isAccountOrOutage(status)) return new Error(`Firecrawl answered ${status}: ${text.slice(0, 200)}`);
  if (!isSuccessStatus(status) || !body.success || !body.data) return new ScanError("SITE_UNREACHABLE");
  return body;
}

async function callFirecrawl(endpoint: string, payload: Record<string, unknown>, timeoutMs: number): Promise<FirecrawlResponse> {
  const response = await postFirecrawl(endpoint, payload, timeoutMs);
  const text = await readBody(response);
  const body = parseJson(text);
  const outcome = classifyResponse(response.status, body, text);
  if (outcome instanceof Error) throw outcome;
  return outcome;
}

/** Only a reported address we can parse is trusted: everything downstream resolves links against it. */
function finalUrl(reported: string | undefined, requested: URL): string {
  if (typeof reported === "string" && reported.length > 0 && URL.canParse(reported)) return reported;
  return requested.href;
}

/** The time we may still spend, capped at the ceiling. Throws once the deadline has passed. */
function remainingMs(deadline: number, ceilingMs: number): number {
  const remaining = deadline - Date.now();
  if (remaining <= 0) throw new ScanError("SITE_UNREACHABLE");
  return Math.min(ceilingMs, remaining);
}

/**
 * One rendered page; branding is only needed for the home page. A ScanError means the website or
 * the address is at fault, a plain Error means our Firecrawl account or a Firecrawl outage.
 */
export async function fetchPage(rawUrl: string, options: { deadline: number; withBranding?: boolean }): Promise<FetchedPage> {
  const url = await vetAddress(rawUrl);
  const timeoutMs = remainingMs(options.deadline, config.firecrawl.RENDER_TIMEOUT_MS);

  const formats = options.withBranding ? ["rawHtml", "links", "branding"] : ["rawHtml", "links"];
  const payload = { url: url.href, formats, onlyMainContent: false };
  const { data } = await callFirecrawl(config.firecrawl.SCRAPE_URL, payload, timeoutMs);
  if (!data) throw new ScanError("SITE_UNREACHABLE");

  const status = data.metadata?.statusCode ?? 200;
  if (status >= 400) throw new ScanError("SITE_UNREACHABLE");

  const html = data.rawHtml ?? "";
  if (html.length < config.firecrawl.MIN_WEBPAGE_CHARS) throw new ScanError("NOT_A_WEBSITE");

  return {
    url: finalUrl(data.metadata?.url, url),
    html: html.slice(0, config.firecrawl.MAX_HTML_CHARS),
    links: data.links ?? [],
    branding: data.branding,
  };
}

function clampLimit(limit: number): number {
  return Math.min(config.firecrawl.MAX_SEARCH_HITS, Math.max(1, Math.floor(limit)));
}

/** Only a hit whose address parses is kept: the read-page tool resolves it later. */
function toSearchHit(hit: Partial<SearchHit>): SearchHit | null {
  if (typeof hit.url !== "string" || !URL.canParse(hit.url)) return null;
  return { url: hit.url, title: hit.title ?? "", description: hit.description ?? "" };
}

/**
 * Web search through Firecrawl. Results are not vetted here: nothing is fetched until a page is
 * read with fetchPage, which runs vetAddress. Errors follow fetchPage's rule: ScanError for a
 * failed search, a plain Error for our account or a Firecrawl outage.
 */
export async function searchWeb(query: string, options: { limit: number; deadline: number }): Promise<SearchHit[]> {
  const timeoutMs = remainingMs(options.deadline, config.firecrawl.SEARCH_TIMEOUT_MS);
  const payload = { query: query.trim(), limit: clampLimit(options.limit), sources: ["web"] };
  const { data } = await callFirecrawl(config.firecrawl.SEARCH_URL, payload, timeoutMs);
  return (data?.web ?? []).map(toSearchHit).filter((hit) => hit !== null);
}

function cutOnWordBoundary(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  return lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
}

/**
 * Everything a visitor can read on the page, menus and footer included: the fallback when the
 * extractor left nothing. On an image-led home page the menu is the offer structure.
 */
function plainText(html: string): string {
  const $ = load(html);
  $(NOT_READABLE_TAGS).remove();
  const body = $("body");
  body.find(BLOCK_TAGS).append(" ");
  return body.text().replace(/\s+/g, " ").trim();
}

/**
 * One vetted page as title plus readable text: the scan's own extractor first, the plainer read of
 * the same HTML when the extractor left too little. No second Firecrawl request either way.
 */
export async function readMainText(rawUrl: string, deadline: number): Promise<MainText> {
  const page = await fetchPage(rawUrl, { deadline });
  const facts = extractPageFacts(page.url, page.html);
  const text = facts.text.length >= config.firecrawl.MIN_USEFUL_TEXT_CHARS ? facts.text : plainText(page.html);
  return { url: page.url, title: facts.title, text: cutOnWordBoundary(text, config.firecrawl.MAX_MAIN_TEXT_CHARS) };
}
