import type { BusinessInfo } from "@social-agent/shared";
import { config } from "../config/constants";
import { pickPages } from "./discover-pages";
import { extractPageFacts } from "./extract-facts";
import { buildStyleFacts } from "./extract-style";
import { fetchPage, type FetchedPage } from "./firecrawl";
import { ScanError, type Discovery, type PageFacts, type SiteFacts } from "./types";

// The whole scan with no AI in it. Runs without a database: `scan -- <url> --facts`.

/** Step "discover": the home page, its branding, and the inner pages worth reading. A failure here fails the scan. */
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

function collectPages(
  home: PageFacts,
  fetched: PromiseSettledResult<FetchedPage>[],
): { pages: PageFacts[]; parseFailures: number } {
  const pages = [home];
  let parseFailures = 0;
  for (const result of fetched) {
    if (result.status !== "fulfilled") continue;
    const alreadyRead = pages.some((page) => page.url === result.value.url); // two links, one page after redirects
    if (alreadyRead) continue;
    try {
      pages.push(extractPageFacts(result.value.url, result.value.html));
    } catch {
      // One page whose markup defeats the parser must not lose the whole scan; it counts as unread.
      parseFailures += 1;
    }
  }
  return { pages, parseFailures };
}

function unreadPagesWarning(
  fetched: PromiseSettledResult<FetchedPage>[],
  parseFailures: number,
  deadline: number,
): string | undefined {
  const failed = fetched.filter((result) => result.status === "rejected").length + parseFailures;
  if (failed === 0) return undefined;
  const ranOut = Date.now() >= deadline ? " The scan ran out of time." : "";
  return `${failed} ${failed === 1 ? "page" : "pages"} could not be read.${ranOut}`;
}

const hasAnyDetail = (info: BusinessInfo) => Object.keys(info).length > 0;

function businessInfo(pages: PageFacts[]): BusinessInfo | undefined {
  const phone = pages.flatMap((page) => page.phones)[0];
  const email = pages.flatMap((page) => page.emails)[0];
  const location = pages.map((page) => page.location).find(Boolean);
  const hours = pages.map((page) => page.hours).find(Boolean);

  const info: BusinessInfo = {};
  if (phone) info.phone = phone;
  if (email) info.email = email;
  if (location) info.location = location;
  if (hours) info.hours = hours;
  return hasAnyDetail(info) ? info : undefined;
}

/** Step "read-pages": the inner pages in parallel, then one SiteFacts. */
export async function readSite(discovery: Discovery, deadline: number): Promise<{ facts: SiteFacts; warnings: string[] }> {
  const fetched = await Promise.allSettled(discovery.pageUrls.map((pageUrl) => fetchPage(pageUrl, { deadline })));
  const { pages, parseFailures } = collectPages(discovery.home, fetched);

  const warnings = [...discovery.styleWarnings];
  const unread = unreadPagesWarning(fetched, parseFailures, deadline);
  if (unread) warnings.push(unread);

  const words = pages.reduce((total, page) => total + page.wordCount, 0);
  if (words < config.scan.MIN_WORDS_PER_SITE) throw new ScanError("NO_CONTENT");

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
