import { load, type CheerioAPI } from "cheerio";
import { z } from "zod";
import { timeSchema, type BusinessInfo, type Weekday } from "@social-agent/shared";
import type { PageFacts } from "./types";

const MAX_HEADINGS = 30;
const MAX_WORDS = 1500;

// schema.org types that describe the page, not the business. Includes pure value/component types
// (an address, a rating, a menu item, ...) that are only ever a property of a business node, never
// the business itself, so they must not be picked up as one when the walker descends into them.
// "Place" and "ContactPoint" are deliberately not here: either can legitimately carry the address,
// phone or email of the business itself.
const NOT_A_BUSINESS = /^(WebSite|WebPage|AboutPage|ContactPage|ProfilePage|ItemPage|BreadcrumbList|ListItem|Person|Article|BlogPosting|NewsArticle|Product|Offer|Review|AggregateRating|Rating|ImageObject|VideoObject|SearchAction|ReadAction|FAQPage|Question|Answer|ItemList|CollectionPage|PostalAddress|GeoCoordinates|OpeningHoursSpecification|QuantitativeValue|PropertyValue|EntryPoint|Menu|MenuSection|MenuItem|Brand|Country|City|State)$/;

// A page-level node's own type (the page IS a WebSite/WebPage/..., not a business). Kept separate
// from NOT_A_BUSINESS because it drives a different decision below: whether to descend into
// mainEntity/about, not whether the node itself counts as a business.
const PAGE_LEVEL_TYPE = /^(WebSite|WebPage|AboutPage|ContactPage|ProfilePage|ItemPage|CollectionPage)$/;

// Properties that keep "the same business, or a part of it" when descending FROM A NODE THAT IS
// ITSELF A BUSINESS: a sub-organization, department or location are still facts about that same
// business. Never includes itemReviewed/publisher/author/worksFor/parentOrganization/provider/
// brand/review/memberOf/sponsor/... — those explicitly name a *different* entity.
const BUSINESS_CHILD_PROPS = ["subOrganization", "department", "location"];

// Properties that keep "the same business" only when descending FROM A PAGE-LEVEL NODE (the node
// describes the page itself, e.g. WebPage/AboutPage/ContactPage): what the page's main subject or
// topic is. A page-level node has no business identity of its own to leak, so this is safe.
const PAGE_CHILD_PROPS = ["mainEntity", "about"];
const WEEKDAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const SOCIAL = /^https?:\/\/(www\.)?(instagram\.com\/[\w.]+|facebook\.com\/[\w.-]+|linkedin\.com\/(company|in)\/[\w-]+|tiktok\.com\/@[\w.]+)\/?$/i;

type Node = Record<string, unknown>;

export const countWords = (text: string) => (text.trim() === "" ? 0 : text.trim().split(/\s+/).length);
const clean = (value: unknown) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "");
const unique = (values: string[]) => [...new Set(values.filter(Boolean))];

/**
 * A stray "%" in an href makes decodeURIComponent throw. Such a link identifies nobody, so it is
 * skipped rather than kept as garbage.
 */
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

/** The values that decode. One that does not is dropped: a contact detail is right or it is absent. */
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
 * A social profile link, normalised: the query string is dropped, except for a legacy
 * Facebook "profile.php?id=..." link, whose numeric id is the only thing that identifies
 * the profile. A profile.php link with no numeric id identifies nobody, so it is dropped
 * entirely, as are share/sharer/intent links (those point at a piece of content, not a profile).
 */
function socialProfile(href: string, base: string): string | undefined {
  const found = absolute(href, base);
  if (!found) return undefined;
  if (/\/(sharer|share|intent)\b/i.test(found)) return undefined;

  let url: URL;
  try {
    url = new URL(found);
  } catch {
    return undefined;
  }

  if (/(^|\.)facebook\.com$/i.test(url.hostname) && /^\/profile\.php\/?$/i.test(url.pathname)) {
    const id = url.searchParams.get("id");
    return id && /^\d+$/.test(id) ? `${url.origin}/profile.php?id=${id}` : undefined;
  }

  const normalized = `${url.origin}${url.pathname}`;
  return SOCIAL.test(normalized) ? normalized : undefined;
}

const MAX_NODE_DEPTH = 6;

function nodeTypes(node: Node): string[] {
  return [node["@type"]].flat().filter((type): type is string => typeof type === "string");
}

/** Passes the type test used to decide whether a node's OWN facts are eligible to be read as a business. */
function isBusinessType(node: Node): boolean {
  const types = nodeTypes(node);
  return types.length > 0 && !types.every((type) => NOT_A_BUSINESS.test(type));
}

function isPageLevelType(node: Node): boolean {
  return nodeTypes(node).some((type) => PAGE_LEVEL_TYPE.test(type));
}

/**
 * Every JSON-LD node on the page that is reachable through a property meaning "the same business,
 * or a part of it" — never through a property that explicitly names a *different* entity
 * (itemReviewed, publisher, author, worksFor, parentOrganization, provider, brand, review,
 * memberOf, sponsor, potentialAction, offers, ...). Concretely: always descend through `@graph`
 * and array membership; from a node that is itself a business, also through
 * subOrganization/department/location; from a page-level node (WebSite/WebPage/AboutPage/...),
 * also through mainEntity/about. Parents are pushed before their children, so when two nodes on
 * the page both have a fact, the outer, more general one is still read first (readLocation/
 * readHours/etc. all take the first node with a truthy result). Depth is capped so a hostile or
 * malformed document cannot make this walk unbounded.
 */
function businessNodes($: CheerioAPI): Node[] {
  const nodes: Node[] = [];
  const walk = (value: unknown, depth: number) => {
    if (depth > MAX_NODE_DEPTH) return;
    if (Array.isArray(value)) {
      value.forEach((item) => walk(item, depth)); // array membership never consumes depth
      return;
    }
    if (!value || typeof value !== "object") return;
    const node = value as Node;
    nodes.push(node);

    // @graph always continues the same document, regardless of this node's own type.
    if ("@graph" in node) walk(node["@graph"], depth + 1);

    const sameEntityProps = isBusinessType(node)
      ? BUSINESS_CHILD_PROPS
      : isPageLevelType(node)
        ? PAGE_CHILD_PROPS
        : [];
    for (const key of sameEntityProps) {
      if (key in node) walk(node[key], depth + 1);
    }
  };
  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      walk(JSON.parse($(element).text()), 0);
    } catch {
      // Broken JSON-LD is common. It is simply not a source.
    }
  });
  return nodes.filter(isBusinessType);
}

function readLocation(address: unknown): BusinessInfo["location"] {
  if (typeof address === "string") return clean(address) ? { address: clean(address) } : undefined;
  if (!address || typeof address !== "object") return undefined;
  const node = address as Node;
  const country = node.addressCountry;
  const location = {
    address: clean(node.streetAddress) || undefined,
    city: clean(node.addressLocality) || undefined,
    region: clean(node.addressRegion) || undefined,
    country: clean(typeof country === "object" && country ? (country as Node).name : country) || undefined,
  };
  return Object.values(location).some(Boolean) ? location : undefined;
}

/** Hours that do not parse cleanly are left out rather than guessed. */
function readHours(spec: unknown): BusinessInfo["hours"] {
  const hours: NonNullable<BusinessInfo["hours"]> = [];
  for (const entry of [spec].flat()) {
    if (!entry || typeof entry !== "object") continue;
    const node = entry as Node;
    const open = timeSchema.safeParse(clean(node.opens).slice(0, 5));
    const close = timeSchema.safeParse(clean(node.closes).slice(0, 5));
    if (!open.success || !close.success) continue;
    for (const day of [node.dayOfWeek].flat()) {
      // "Monday", "https://schema.org/Monday" and "Mo" all start with the weekday's first letters.
      const key = clean(day).split("/").pop()!.slice(0, 3).toLowerCase() as Weekday;
      if (!WEEKDAYS.includes(key)) continue;
      if (hours.some((h) => h.day === key && h.open === open.data && h.close === close.data)) continue;
      hours.push({ day: key, open: open.data, close: close.data });
    }
  }
  return hours.length > 0 ? hours : undefined;
}

function findLogo($: CheerioAPI, nodes: Node[], url: string, ogImage?: string): string | undefined {
  for (const node of nodes) {
    const logo = node.logo;
    const found = absolute(typeof logo === "object" && logo ? (logo as Node).url : logo, url);
    if (found) return found;
  }
  const image = $("img")
    .filter((_, element) => {
      const el = $(element);
      return /logo/i.test([el.attr("class"), el.attr("id"), el.attr("alt"), el.attr("src")].join(" "));
    })
    .first();
  return (
    absolute(image.attr("src"), url) ??
    ogImage ??
    absolute($('link[rel~="icon"]').attr("href") ?? $('link[rel="apple-touch-icon"]').attr("href"), url)
  );
}

function mainText($: CheerioAPI): string {
  $("nav, header, footer, aside, script, style, noscript, form, svg, iframe, template").remove();
  $("[class], [id]")
    .filter((_, element) => {
      const el = $(element);
      // Never drop the structural containers themselves, or a wrapper that holds one of them:
      // a "modal-open" class on <body>, or a "cookie-banner" wrapper around <main>, must not
      // erase the whole page.
      if (el.is("html, body, main, article")) return false;
      if (el.find("main, article").length > 0) return false;
      return /cookie|consent|banner|modal|popup/i.test(`${el.attr("class") ?? ""} ${el.attr("id") ?? ""}`);
    })
    .remove();

  const root = $("main").first().length ? $("main").first() : $("article").first().length ? $("article").first() : $("body");
  // .text() joins elements with nothing between them: "<h2>Menu</h2><p>Bread</p>" reads "MenuBread".
  root.find("p, div, li, br, h1, h2, h3, h4, h5, h6, td, th, section, article, blockquote, dt, dd").append(" ");
  return root.text().replace(/\s+/g, " ").trim().split(" ").slice(0, MAX_WORDS).join(" ");
}

/** Everything code can know about one page. Destroys nothing outside its own parsed copy. */
export function extractPageFacts(url: string, html: string): PageFacts {
  const $ = load(html);
  const meta = (selector: string) => clean($(selector).attr("content")) || undefined;
  const nodes = businessNodes($);

  const og = {
    siteName: meta('meta[property="og:site_name"]'),
    title: meta('meta[property="og:title"]'),
    description: meta('meta[property="og:description"]'),
    image: absolute(meta('meta[property="og:image"]'), url),
  };

  const hrefs = $("a[href]").map((_, element) => $(element).attr("href")?.trim() ?? "").get();
  // A mailto's headers ("?subject=...") are not part of the address, so they go before decoding.
  const mailtoAddresses = hrefsWithScheme(hrefs, "mailto:").map((value) => value.split("?")[0]!);

  const phones = unique([
    ...decodeAll(hrefsWithScheme(hrefs, "tel:")).map((phone) => phone.trim()),
    ...nodes.map((node) => clean(node.telephone)),
  ]);
  const emails = unique([
    ...decodeAll(mailtoAddresses).map((email) => email.trim().toLowerCase()),
    ...nodes.map((node) => clean(node.email).replace(/^mailto:/i, "").toLowerCase()),
  ]).filter((email) => z.email().safeParse(email).success);

  const socialLinks = unique(
    hrefs.map((href) => socialProfile(href, url)).filter((href): href is string => Boolean(href)),
  );

  const headings = unique($("h1, h2, h3").map((_, element) => clean($(element).text())).get()).slice(0, MAX_HEADINGS);
  const logo = findLogo($, nodes, url, og.image);
  const location = nodes.map((node) => readLocation(node.address)).find(Boolean);
  const hours = nodes.map((node) => readHours(node.openingHoursSpecification)).find(Boolean);
  const title = clean($("title").first().text());

  // Last: this removes elements from the parsed copy.
  const text = mainText($);

  return {
    url,
    title,
    description: meta('meta[name="description"]'),
    og,
    schemaNames: unique(nodes.map((node) => clean(node.name))),
    headings,
    text,
    wordCount: countWords(text),
    logo,
    phones,
    emails,
    location,
    hours,
    socialLinks,
  };
}
