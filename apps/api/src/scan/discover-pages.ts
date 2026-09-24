import { load } from "cheerio";
import { config } from "../config/constants";

// Which inner pages are worth reading, most useful group first. Plain data, so another
// language's words ("ueber-uns", "kontakt") can be added without touching the code below.
const GROUPS: { name: string; words: string[] }[] = [
  { name: "about", words: ["about", "about-us", "our-story", "who-we-are", "story"] },
  { name: "offer", words: ["services", "products", "menu", "what-we-do", "solutions", "shop"] },
  { name: "contact", words: ["contact", "contact-us", "find-us", "locations", "visit"] },
  { name: "pricing", words: ["pricing", "prices", "plans"] },
  { name: "team", words: ["team", "our-team", "people"] },
  { name: "blog", words: ["blog", "news", "journal"] },
];

const NON_PAGE_SCHEME = /^(mailto:|tel:|sms:|javascript:|#)/i;

// Paths that are a visitor's own business, not the brand's, and files that are not pages.
const ACCOUNT_OR_LEGAL_WORDS = [
  "log-?in", "sign-?in", "sign-?up", "register", "account", "cart", "basket",
  "checkout", "search", "privacy", "terms", "cookies?", "legal",
];
const NON_PAGE_EXTENSIONS = [
  "pdf", "jpe?g", "png", "gif", "webp", "svg", "ico", "zip", "rar", "gz", "7z",
  "mp4", "mp3", "mov", "docx?", "xlsx?", "pptx?", "css", "js", "xml", "json",
];
const ACCOUNT_OR_LEGAL_PATH = new RegExp(`(^|[-_/])(${ACCOUNT_OR_LEGAL_WORDS.join("|")})($|[-_/.])`, "i");
const NON_PAGE_EXTENSION = new RegExp(`\\.(${NON_PAGE_EXTENSIONS.join("|")})$`, "i");

const bareHost = (host: string) => host.toLowerCase().replace(/^www\./, "");
const hasWord = (value: string, word: string) => new RegExp(`(^|[-_/])${word}($|[-_/.])`).test(value);

type Link = { url: string; path: string; text: string };

/** The link's address when it stays on this site, with the hash and query dropped. */
function sameSiteUrl(href: string, home: URL): URL | undefined {
  let url: URL;
  try {
    url = new URL(href, home);
  } catch {
    return undefined;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
  if (bareHost(url.hostname) !== bareHost(home.hostname)) return undefined;
  url.hash = "";
  url.search = "";
  return url;
}

/** One entry per path, keeping the first link to it, so a repeated nav link counts once. */
function internalLinks(html: string, home: URL, homePath: string): Map<string, Link> {
  const $ = load(html);
  const links = new Map<string, Link>();

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href")?.trim();
    if (!href || NON_PAGE_SCHEME.test(href)) return;

    const url = sameSiteUrl(href, home);
    if (!url) return;

    const path = (url.pathname.replace(/\/+$/, "") || "/").toLowerCase();
    if (path === "/" || path === homePath.toLowerCase()) return;
    if (ACCOUNT_OR_LEGAL_PATH.test(path) || NON_PAGE_EXTENSION.test(path)) return;
    if (links.has(path)) return;

    const text = $(element).text().trim().toLowerCase().replace(/\s+/g, "-");
    links.set(path, { url: url.href, path, text });
  });

  return links;
}

const depth = (link: Link) => link.path.split("/").length;
const matchesGroup = (link: Link, words: string[]) =>
  words.some((word) => hasWord(link.path, word) || hasWord(link.text, word));

/** GROUPS order is the priority order: an earlier group takes its share of config.scan.MAX_PAGES first. */
function pickByGroup(links: Link[]): Link[] {
  const picked: Link[] = [];
  for (const group of GROUPS) {
    const matches = links
      .filter((link) => !picked.includes(link))
      .filter((link) => matchesGroup(link, group.words))
      .sort((a, b) => depth(a) - depth(b) || a.path.length - b.path.length)
      .slice(0, config.scan.MAX_PAGES_PER_GROUP);
    picked.push(...matches);
  }
  return picked;
}

export function pickPages(homeUrl: string, html: string): string[] {
  const home = new URL(homeUrl);
  const homePath = home.pathname.replace(/\/+$/, "") || "/";
  const links = internalLinks(html, home, homePath);
  return pickByGroup([...links.values()])
    .slice(0, config.scan.MAX_PAGES)
    .map((link) => link.url);
}
