import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { isBlockedAddress } from "./address-check";
import { ScanError } from "./types";

// The only file that reads a website: Firecrawl renders the page on its own servers, so our
// server never connects to a user-typed address. Firecrawl does not refuse private addresses
// (checked 2026-09-22: it fetched 127.0.0.1:8080), so vetAddress runs before every call.

const FIRECRAWL_SCRAPE_URL = "https://api.firecrawl.dev/v2/scrape";
const RENDER_TIMEOUT_MS = 30_000; // a browser render of one page takes 2-10 s
const MAX_HTML_CHARS = 2_000_000;
// A PDF or an image comes back as a stub document around the extracted text, not as a web page.
const MIN_WEBPAGE_CHARS = 200;
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

type FirecrawlResponse = {
  success?: boolean;
  error?: string;
  code?: string;
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

function parseJson(text: string): FirecrawlResponse {
  try {
    return JSON.parse(text) as FirecrawlResponse;
  } catch {
    return {};
  }
}

async function postScrape(url: URL, formats: string[], timeoutMs: number): Promise<Response> {
  try {
    return await fetch(FIRECRAWL_SCRAPE_URL, {
      method: "POST",
      headers: requestHeaders(),
      body: JSON.stringify({ url: url.href, formats, onlyMainContent: false, timeout: timeoutMs }),
      signal: AbortSignal.timeout(timeoutMs + 5_000),
    });
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

async function callFirecrawl(url: URL, formats: string[], timeoutMs: number): Promise<FirecrawlResponse> {
  const response = await postScrape(url, formats, timeoutMs);
  const text = await readBody(response);
  const outcome = classifyResponse(response.status, parseJson(text), text);
  if (outcome instanceof Error) throw outcome;
  return outcome;
}

/** Only a reported address we can parse is trusted: everything downstream resolves links against it. */
function finalUrl(reported: string | undefined, requested: URL): string {
  if (typeof reported === "string" && reported.length > 0 && URL.canParse(reported)) return reported;
  return requested.href;
}

/**
 * One rendered page; branding is only needed for the home page. A ScanError means the website or
 * the address is at fault, a plain Error means our Firecrawl account or a Firecrawl outage.
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
    url: finalUrl(data.metadata?.url, url),
    html: html.slice(0, MAX_HTML_CHARS),
    links: data.links ?? [],
    branding: data.branding,
  };
}
