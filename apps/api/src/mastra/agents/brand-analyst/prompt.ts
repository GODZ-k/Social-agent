import type { SiteFacts } from "../../../scan/types";

// About 7k tokens of page text at ~4 characters per token. The home page gets the largest share.
const TEXT_BUDGET = 28_000;
const HOME_SHARE = 8_000;

// Scraped text must never be able to close the <site> block early (by accident or as a prompt
// injection), so strip anything that looks like the delimiter tag before it goes anywhere near the prompt.
// Zero-width and bidi characters are removed first so a tag hidden with one (a zero-width space
// between the "s" and the "ite" of "</site>") is still caught.
const INVISIBLE = /[\u00AD\u200B\u200C\u200D\u2060\uFEFF\u202A-\u202E\u2066-\u2069]/g;

const data = (value: string) => value.replace(INVISIBLE, "").replace(/<\/?\s*site\b[^>]*>/gi, " ");

const line = (label: string, value?: string | string[]) => {
  const text = Array.isArray(value) ? value.map(data).join(", ") : value !== undefined ? data(value) : value;
  return text ? `${label}: ${text}\n` : "";
};

/** The one user message of a scan: the site's facts as compact text, inside a marked block. */
export function renderSiteFacts(facts: SiteFacts): string {
  const others = Math.max(facts.pages.length - 1, 1);
  const perPage = Math.min(HOME_SHARE, Math.floor((TEXT_BUDGET - HOME_SHARE) / others));

  const pages = facts.pages
    .map((page, index) => {
      const budget = index === 0 ? HOME_SHARE : perPage;
      const text = data(page.text).slice(0, budget);
      return (
        `## Page: ${data(page.url)}\n` +
        line("Title", page.title) +
        line("Description", page.description ?? page.og.description) +
        line("Headings", page.headings.map(data).join(" | ")) +
        (text ? `Text: ${text}\n` : "")
      );
    })
    .join("\n");

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
