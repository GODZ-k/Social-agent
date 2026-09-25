// Everything one page of HTML can say about a business on its own: identity, contact details,
// schema.org facts, social links, logo and readable text. No network, no Mastra.
import { load, type CheerioAPI } from "cheerio";
import { z } from "zod";
import { timeSchema, weekdaySchema, type BusinessInfo, type Weekday } from "@social-agent/shared";
import { config } from "@/config/constants";
import type { PageFacts } from "./types";

// Page types, and pure value types (address, rating, menu item). "Place" and "ContactPoint" are
// left out on purpose: either can carry the business's own address, phone or email.
const NOT_A_BUSINESS = new Set([
  "WebSite", "WebPage", "AboutPage", "ContactPage", "ProfilePage", "ItemPage", "CollectionPage",
  "BreadcrumbList", "ListItem", "ItemList", "Person", "Article", "BlogPosting", "NewsArticle",
  "Product", "Offer", "Review", "AggregateRating", "Rating", "ImageObject", "VideoObject",
  "SearchAction", "ReadAction", "EntryPoint", "FAQPage", "Question", "Answer", "PostalAddress",
  "GeoCoordinates", "OpeningHoursSpecification", "QuantitativeValue", "PropertyValue",
  "Menu", "MenuSection", "MenuItem", "Brand", "Country", "City", "State",
]);

// Kept apart from NOT_A_BUSINESS because it answers a different question: not "is this node a
// business?" but "may the walk descend into mainEntity/about from here?".
const PAGE_LEVEL_TYPES = new Set([
  "WebSite", "WebPage", "AboutPage", "ContactPage", "ProfilePage", "ItemPage", "CollectionPage",
]);

// A sub-organization, department or location is still the same business. Never publisher, author,
// parentOrganization, brand or itemReviewed: donangie.com's reviews carried a Review.itemReviewed
// LocalBusiness whose phone and address belonged to another company.
const BUSINESS_CHILD_PROPS = ["subOrganization", "department", "location"];

// Descending from a page-level node: what the page is about. Safe only there, because a page-level
// node has no business identity of its own to leak into the result.
const PAGE_CHILD_PROPS = ["mainEntity", "about"];

const SOCIAL_PROFILE_PATHS = [
  "instagram\\.com/[\\w.]+",
  "facebook\\.com/[\\w.-]+",
  "linkedin\\.com/(company|in)/[\\w-]+",
  "tiktok\\.com/@[\\w.]+",
];
const SOCIAL_PROFILE_URL = new RegExp(`^https?://(www\\.)?(${SOCIAL_PROFILE_PATHS.join("|")})/?$`, "i");
const SHARE_PATH = /\/(sharer|share|intent)\b/i;
const FACEBOOK_HOST = /(^|\.)facebook\.com$/i;
const FACEBOOK_PROFILE_PATH = /^\/profile\.php\/?$/i;
const NUMERIC_ID = /^\d+$/;
const LOOKS_LIKE_LOGO = /logo/i;

const NOISE_WORDS = ["cookie", "consent", "banner", "modal", "popup"];
const NOISE_NAME = new RegExp(NOISE_WORDS.join("|"), "i");
const NOISE_TAGS = "nav, header, footer, aside, script, style, noscript, form, svg, iframe, template";
const CONTENT_TAGS = ["main", "article"];
const WRAPS_CONTENT = CONTENT_TAGS.join(", ");
const IS_CONTENT_ROOT = ["html", "body", ...CONTENT_TAGS].join(", ");
const BLOCK_TAGS = "p, div, li, br, h1, h2, h3, h4, h5, h6, td, th, section, article, blockquote, dt, dd";

type Node = Record<string, unknown>;

export const countWords = (text: string) => (text.trim() === "" ? 0 : text.trim().split(/\s+/).length);
const clean = (value: unknown) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "");
const unique = (values: string[]) => [...new Set(values.filter(Boolean))];

/** schema.org writes a value either as a bare string or as a node carrying the field. */
function fieldOrSelf(value: unknown, field: string): unknown {
  return typeof value === "object" && value ? (value as Node)[field] : value;
}

/** A stray "%" makes decodeURIComponent throw. Such a link identifies nobody, so it is skipped. */
function decodeOrSkip(value: string): string | undefined {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    if (error instanceof URIError) return undefined;
    throw error;
  }
}

/** Every href with this scheme, with the scheme removed. Matched case-insensitively. */
function hrefsWithScheme(hrefs: string[], scheme: string): string[] {
  return hrefs.filter((href) => href.toLowerCase().startsWith(scheme)).map((href) => href.slice(scheme.length));
}

/** One that does not decode is dropped: a contact detail is right, or it is absent. */
function decodeAll(values: string[]): string[] {
  return values.map(decodeOrSkip).filter((value): value is string => value !== undefined);
}

function absolute(value: unknown, base: string): string | undefined {
  const text = clean(value);
  if (!text || text.startsWith("data:")) return undefined;
  try {
    return new URL(text, base).href;
  } catch {
    return undefined;
  }
}

/**
 * The query string is dropped, except a legacy Facebook "profile.php?id=": its numeric id is the
 * only thing identifying the profile. Share/intent links point at content, not a profile.
 */
function socialProfile(href: string, base: string): string | undefined {
  const found = absolute(href, base);
  if (!found) return undefined;
  if (SHARE_PATH.test(found)) return undefined;

  let url: URL;
  try {
    url = new URL(found);
  } catch {
    return undefined;
  }

  if (FACEBOOK_HOST.test(url.hostname) && FACEBOOK_PROFILE_PATH.test(url.pathname)) {
    const id = url.searchParams.get("id");
    return id && NUMERIC_ID.test(id) ? `${url.origin}/profile.php?id=${id}` : undefined;
  }

  const normalized = `${url.origin}${url.pathname}`;
  return SOCIAL_PROFILE_URL.test(normalized) ? normalized : undefined;
}

function nodeTypes(node: Node): string[] {
  return [node["@type"]].flat().filter((type): type is string => typeof type === "string");
}

function isBusinessType(node: Node): boolean {
  const types = nodeTypes(node);
  return types.length > 0 && !types.every((type) => NOT_A_BUSINESS.has(type));
}

function isPageLevelType(node: Node): boolean {
  return nodeTypes(node).some((type) => PAGE_LEVEL_TYPES.has(type));
}

/** The properties that still mean "the same business, or a part of it" from this node. */
function sameEntityProperties(node: Node): string[] {
  if (isBusinessType(node)) return BUSINESS_CHILD_PROPS;
  if (isPageLevelType(node)) return PAGE_CHILD_PROPS;
  return [];
}

/** Depth is capped so a malformed or hostile document cannot make the walk unbounded. */
function collectFrom(value: unknown, depth: number, found: Node[]): void {
  if (depth > config.scan.MAX_JSON_LD_DEPTH) return;
  if (Array.isArray(value)) {
    value.forEach((item) => collectFrom(item, depth, found)); // array membership never consumes depth
    return;
  }
  if (!value || typeof value !== "object") return;
  const node = value as Node;
  found.push(node);

  // @graph always continues the same document, whatever this node's own type is.
  if ("@graph" in node) collectFrom(node["@graph"], depth + 1, found);

  for (const key of sameEntityProperties(node)) {
    if (key in node) collectFrom(node[key], depth + 1, found);
  }
}

/**
 * Parents are collected before their children, so when two nodes both carry a fact the outer, more
 * general one is read first — every reader below takes the first node with a truthy result.
 */
function businessNodes($: CheerioAPI): Node[] {
  const found: Node[] = [];
  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      const json = JSON.parse($(element).text());
      collectFrom(json, 0, found);
    } catch {
      // Broken JSON-LD is common. It is simply not a source.
    }
  });
  return found.filter(isBusinessType);
}

function readLocation(address: unknown): BusinessInfo["location"] {
  if (typeof address === "string") return clean(address) ? { address: clean(address) } : undefined;
  if (!address || typeof address !== "object") return undefined;
  const node = address as Node;
  const country = fieldOrSelf(node.addressCountry, "name");
  const location = {
    address: clean(node.streetAddress) || undefined,
    city: clean(node.addressLocality) || undefined,
    region: clean(node.addressRegion) || undefined,
    country: clean(country) || undefined,
  };
  return Object.values(location).some(Boolean) ? location : undefined;
}

/** Hours that do not parse cleanly are left out rather than guessed. */
function readHours(spec: unknown): BusinessInfo["hours"] {
  const hours: NonNullable<BusinessInfo["hours"]> = [];
  for (const entry of [spec].flat()) {
    if (!entry || typeof entry !== "object") continue;
    const node = entry as Node;
    const openTime = clean(node.opens).slice(0, 5);
    const open = timeSchema.safeParse(openTime);
    const closeTime = clean(node.closes).slice(0, 5);
    const close = timeSchema.safeParse(closeTime);
    if (!open.success || !close.success) continue;
    for (const day of [node.dayOfWeek].flat()) {
      // "Monday", "https://schema.org/Monday" and "Mo" all start with the weekday's first letters.
      const key = clean(day).split("/").pop()!.slice(0, 3).toLowerCase() as Weekday;
      if (!weekdaySchema.options.includes(key)) continue;
      if (hours.some((h) => h.day === key && h.open === open.data && h.close === close.data)) continue;
      hours.push({ day: key, open: open.data, close: close.data });
    }
  }
  return hours.length > 0 ? hours : undefined;
}

function linkHrefs($: CheerioAPI): string[] {
  return $("a[href]").map((_, element) => $(element).attr("href")?.trim() ?? "").get();
}

function pageIdentity($: CheerioAPI, url: string) {
  const meta = (selector: string) => {
    const content = $(selector).attr("content");
    return clean(content) || undefined;
  };
  const title = $("title").first().text();
  const image = meta('meta[property="og:image"]');
  return {
    title: clean(title),
    description: meta('meta[name="description"]'),
    og: {
      siteName: meta('meta[property="og:site_name"]'),
      title: meta('meta[property="og:title"]'),
      description: meta('meta[property="og:description"]'),
      image: absolute(image, url),
    },
  };
}

function contactDetails($: CheerioAPI, nodes: Node[]): { phones: string[]; emails: string[] } {
  const hrefs = linkHrefs($);
  // A mailto's headers ("?subject=...") are not part of the address, so they go before decoding.
  const mailtoAddresses = hrefsWithScheme(hrefs, "mailto:").map((value) => value.split("?")[0]!);
  const telNumbers = hrefsWithScheme(hrefs, "tel:");

  const phones = unique([
    ...decodeAll(telNumbers).map((phone) => phone.trim()),
    ...nodes.map((node) => clean(node.telephone)),
  ]);
  const emails = unique([
    ...decodeAll(mailtoAddresses).map((email) => email.trim().toLowerCase()),
    ...nodes.map((node) => clean(node.email).replace(/^mailto:/i, "").toLowerCase()),
  ]).filter((email) => z.email().safeParse(email).success);

  return { phones, emails };
}

function socialLinksOn($: CheerioAPI, url: string): string[] {
  const profiles = linkHrefs($).map((href) => socialProfile(href, url));
  return unique(profiles.filter((href): href is string => Boolean(href)));
}

function headingsOn($: CheerioAPI): string[] {
  const headings = $("h1, h2, h3")
    .map((_, element) => {
      const text = $(element).text();
      return clean(text);
    })
    .get();
  return unique(headings).slice(0, config.scan.MAX_HEADINGS_PER_PAGE);
}

/** Document order decides: the header's logo comes before a footer or partner logo. */
function imageNamedLogo($: CheerioAPI): string | undefined {
  return $("img")
    .filter((_, element) => {
      const el = $(element);
      return LOOKS_LIKE_LOGO.test([el.attr("class"), el.attr("id"), el.attr("alt"), el.attr("src")].join(" "));
    })
    .first()
    .attr("src");
}

function logoOn($: CheerioAPI, nodes: Node[], url: string, ogImage?: string): string | undefined {
  const declared = nodes
    .map((node) => {
      const logo = fieldOrSelf(node.logo, "url");
      return absolute(logo, url);
    })
    .find(Boolean);
  if (declared) return declared;
  const icon = $('link[rel~="icon"]').attr("href") ?? $('link[rel="apple-touch-icon"]').attr("href");
  const namedLogo = imageNamedLogo($);
  return absolute(namedLogo, url) ?? ogImage ?? absolute(icon, url);
}

/** Mutates the parse: chrome and cookie/modal overlays are gone once this has run. */
function removeNoise($: CheerioAPI): void {
  $(NOISE_TAGS).remove();
  $("[class], [id]")
    .filter((_, element) => {
      const el = $(element);
      // A "modal-open" class on <body>, or a cookie wrapper around <main>, must not erase the page.
      const holdsTheContent = el.is(IS_CONTENT_ROOT) || el.find(WRAPS_CONTENT).length > 0;
      return !holdsTheContent && NOISE_NAME.test(`${el.attr("class") ?? ""} ${el.attr("id") ?? ""}`);
    })
    .remove();
}

function contentRoot($: CheerioAPI) {
  const main = $("main").first();
  if (main.length) return main;
  const article = $("article").first();
  if (article.length) return article;
  return $("body");
}

function mainText($: CheerioAPI): string {
  removeNoise($);
  const root = contentRoot($);
  // .text() joins elements with nothing between them: "<h2>Menu</h2><p>Bread</p>" reads "MenuBread".
  root.find(BLOCK_TAGS).append(" ");
  return root.text().replace(/\s+/g, " ").trim().split(" ").slice(0, config.scan.MAX_WORDS_PER_PAGE).join(" ");
}

/** The parsed copy is torn down while reading, so it is created here and never escapes. */
export function extractPageFacts(url: string, html: string): PageFacts {
  const $ = load(html);
  const nodes = businessNodes($);
  const identity = pageIdentity($, url);
  const { phones, emails } = contactDetails($, nodes);
  const socialLinks = socialLinksOn($, url);
  const headings = headingsOn($);
  const logo = logoOn($, nodes, url, identity.og.image);
  const schemaNames = unique(nodes.map((node) => clean(node.name)));
  const location = nodes.map((node) => readLocation(node.address)).find(Boolean);
  const hours = nodes.map((node) => readHours(node.openingHoursSpecification)).find(Boolean);

  // Last: this removes elements from the parsed copy.
  const text = mainText($);

  return {
    url, ...identity, schemaNames, headings, text, wordCount: countWords(text),
    logo, phones, emails, location, hours, socialLinks,
  };
}
