import { config } from "../../../config/constants";
import type { SiteFacts } from "../../../scan/types";

const { TEXT_BUDGET_CHARS, HOME_PAGE_CHARS } = config.brandAnalyst;

const INVISIBLE = /[\u00AD\u200B\u200C\u200D\u2060\uFEFF\u202A-\u202E\u2066-\u2069]/g;
const SITE_TAG = /<\/?\s*site\b[^>]*>/gi;

// Scraped text must never close the <site> block early, by accident or as a prompt injection.
// Invisible characters go first, so a tag hidden with one ("</si<zero-width space>te>") is caught.
const stripDelimiters = (value: string) => value.replace(INVISIBLE, "").replace(SITE_TAG, " ");

function line(label: string, value?: string | string[]): string {
  if (value === undefined) return "";
  const text = Array.isArray(value) ? value.map(stripDelimiters).join(", ") : stripDelimiters(value);
  return text ? `${label}: ${text}\n` : "";
}

function pageBlock(page: SiteFacts["pages"][number], budget: number): string {
  const text = stripDelimiters(page.text).slice(0, budget);
  return (
    `## Page: ${stripDelimiters(page.url)}\n` +
    line("Title", page.title) +
    line("Description", page.description ?? page.og.description) +
    line("Headings", page.headings.map(stripDelimiters).join(" | ")) +
    (text ? `Text: ${text}\n` : "")
  );
}

/** The one user message of a scan: the site's facts as compact text, inside a marked block. */
export function renderSiteFacts(facts: SiteFacts): string {
  const others = Math.max(facts.pages.length - 1, 1);
  const perPage = Math.min(HOME_PAGE_CHARS, Math.floor((TEXT_BUDGET_CHARS - HOME_PAGE_CHARS) / others));
  const pages = facts.pages.map((page, index) => pageBlock(page, index === 0 ? HOME_PAGE_CHARS : perPage)).join("\n");

  return (
    "Draft the brand kit for this business.\n\n<site>\n" +
    line("Website", facts.url) +
    line("Name candidates", facts.nameCandidates) +
    line("Colours", facts.style.colors) +
    line("Heading font", facts.style.fonts.heading) +
    line("Body font", facts.style.fonts.body) +
    line("Social profiles", facts.socialLinks) +
    `\n${pages}</site>`
  );
}
