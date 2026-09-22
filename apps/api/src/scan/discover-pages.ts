import { load } from "cheerio";

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
const MAX_PER_GROUP = 2;
const MAX_PAGES = 6;

const SKIP_PATH = /(^|[-_/])(log-?in|sign-?in|sign-?up|register|account|cart|basket|checkout|search|privacy|terms|cookies?|legal)($|[-_/.])/i;
const SKIP_FILE = /\.(pdf|jpe?g|png|gif|webp|svg|ico|zip|rar|gz|7z|mp4|mp3|mov|docx?|xlsx?|pptx?|css|js|xml|json)$/i;

const bareHost = (host: string) => host.toLowerCase().replace(/^www\./, "");
const hasWord = (value: string, word: string) => new RegExp(`(^|[-_/])${word}($|[-_/.])`).test(value);

type Link = { url: string; path: string; text: string };

export function pickPages(homeUrl: string, html: string): string[] {
  const home = new URL(homeUrl);
  const homePath = home.pathname.replace(/\/+$/, "") || "/";
  const $ = load(html);
  const links = new Map<string, Link>();

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href")?.trim();
    if (!href || /^(mailto:|tel:|sms:|javascript:|#)/i.test(href)) return;

    let url: URL;
    try {
      url = new URL(href, home);
    } catch {
      return;
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") return;
    if (bareHost(url.hostname) !== bareHost(home.hostname)) return;

    url.hash = "";
    url.search = "";
    const path = (url.pathname.replace(/\/+$/, "") || "/").toLowerCase();
    if (path === "/" || path === homePath.toLowerCase()) return;
    if (SKIP_PATH.test(path) || SKIP_FILE.test(path)) return;

    if (!links.has(path)) {
      const text = $(element).text().trim().toLowerCase().replace(/\s+/g, "-");
      links.set(path, { url: url.href, path, text });
    }
  });

  const depth = (link: Link) => link.path.split("/").length;
  const picked: Link[] = [];

  for (const group of GROUPS) {
    const matches = [...links.values()]
      .filter((link) => !picked.includes(link))
      .filter((link) => group.words.some((word) => hasWord(link.path, word) || hasWord(link.text, word)))
      .sort((a, b) => depth(a) - depth(b) || a.path.length - b.path.length)
      .slice(0, MAX_PER_GROUP);
    picked.push(...matches);
  }

  return picked.slice(0, MAX_PAGES).map((link) => link.url);
}
