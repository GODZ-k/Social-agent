import type { SiteFacts } from "@social-agent/shared";
import { cleanText } from "../prompt-text.js";
import { BRAND_ANALYST_LIMITS } from "./limits.js";

const { TEXT_BUDGET_CHARS, HOME_PAGE_CHARS } = BRAND_ANALYST_LIMITS;

// Scraped text goes through cleanText, so it can never close the <site> block early.
function line(label: string, value?: string | string[]): string {
  if (value === undefined) return "";
  const text = Array.isArray(value) ? value.map(cleanText).join(", ") : cleanText(value);
  return text ? `${label}: ${text}\n` : "";
}

function pageBlock(page: SiteFacts["pages"][number], budget: number): string {
  const text = cleanText(page.text).slice(0, budget);
  const headings = page.headings.map(cleanText).join(" | ");
  return (
    `## Page: ${cleanText(page.url)}\n` +
    line("Title", page.title) +
    line("Description", page.description ?? page.og.description) +
    line("Headings", headings) +
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
