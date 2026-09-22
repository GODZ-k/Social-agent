import { load } from "cheerio";
import type { Branding } from "./firecrawl";
import type { StyleFacts } from "./types";

// Colours and fonts from Firecrawl's branding output, cleaned up to the rules below. Code owns
// these facts; the model is never asked for a colour value or a font name.

const MAX_COLORS = 5;
const COLOR_ROLES = ["primary", "secondary", "accent", "link"] as const; // most important first
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

// Fonts a browser or operating system supplies on its own. A stack that starts with these
// (Shopify's "system serif" preset, for example) tells us nothing about the brand.
const SYSTEM_FONTS = new Set([
  "serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui", "system_ui", "ui-serif", "ui-sans-serif",
  "ui-monospace", "ui-rounded", "-apple-system", "blinkmacsystemfont", "inherit", "initial", "unset", "revert",
  "emoji", "math", "arial", "helvetica", "helvetica neue", "times", "times new roman", "georgia", "verdana",
  "tahoma", "trebuchet ms", "segoe ui", "roboto", "noto sans", "liberation sans", "new york", "iowan old style",
  "apple garamond", "baskerville", "droid serif", "apple color emoji", "segoe ui emoji", "segoe ui symbol",
  "noto color emoji",
]);

type Lightness = { lightness: number; saturation: number };

function lightnessAndSaturation(hex: string): Lightness {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const saturation = max === min ? 0 : (max - min) / (1 - Math.abs(2 * lightness - 1));
  return { lightness, saturation };
}

function isBrandColor(hex: string): boolean {
  if (!HEX_COLOR.test(hex)) return false;
  const { lightness, saturation } = lightnessAndSaturation(hex);
  // Rejected: near-white (>0.92), near-black (<0.1) and grey (<0.12 saturation) — none is a brand colour.
  return lightness <= 0.92 && lightness >= 0.1 && saturation >= 0.12;
}

function brandColors(branding: Branding | undefined): string[] {
  const colors: string[] = [];
  for (const role of COLOR_ROLES) {
    const value = branding?.colors?.[role]?.trim();
    if (!value || !isBrandColor(value)) continue;
    const hex = value.toUpperCase();
    if (!colors.includes(hex)) colors.push(hex);
  }
  return colors.slice(0, MAX_COLORS);
}

const cleanFamily = (name: string) => name.trim().replace(/^["']|["']$/g, "").trim();
const isChosenFont = (name: string) => name !== "" && !SYSTEM_FONTS.has(name.toLowerCase());

function firstChosenFont(stack: string[] | undefined): string | undefined {
  return stack?.map(cleanFamily).find(isChosenFont);
}

/** Font names the page loads on purpose: Google Fonts links and @font-face rules, in page order. */
function loadedFontNames(html: string): string[] {
  const $ = load(html);
  const names: string[] = [];

  $('link[href*="fonts.googleapis.com"]').each((_, element) => {
    const href = $(element).attr("href") ?? "";
    let url: URL;
    try {
      url = new URL(href, "https://fonts.googleapis.com");
    } catch {
      return;
    }
    for (const family of url.searchParams.getAll("family")) {
      for (const entry of family.split("|")) names.push(entry.split(":")[0]!.replace(/\+/g, " "));
    }
  });

  const css = $("style").map((_, element) => $(element).text()).get().join("\n");
  for (const match of css.matchAll(/@font-face\s*{[^}]*font-family\s*:\s*([^;}]+)/gi)) names.push(match[1]!);

  return [...new Set(names.map(cleanFamily).filter(isChosenFont))];
}

function brandFonts(branding: Branding | undefined, html: string): { heading?: string; body?: string } {
  const stacks = branding?.typography?.fontStacks;
  let heading = firstChosenFont(stacks?.heading);
  let body = firstChosenFont(stacks?.body);
  if (heading && body) return { heading, body };

  const loaded = loadedFontNames(html);
  heading ??= loaded[0];
  body ??= loaded[1] ?? loaded[0];
  return { heading, body };
}

/** Ranked brand colours and the heading/body fonts, from Firecrawl's branding and the home page HTML. */
export function buildStyleFacts(branding: Branding | undefined, html: string): { style: StyleFacts; warnings: string[] } {
  const warnings: string[] = [];

  const colors = brandColors(branding);
  if (colors.length === 0) warnings.push("No brand colours were found in the website's styling.");

  const { heading, body } = brandFonts(branding, html);
  if (!heading && !body) warnings.push("No fonts were found in the website's styling.");
  const fonts = { heading: heading ?? body ?? "sans-serif", body: body ?? heading ?? "sans-serif" };

  return { style: { colors, fonts }, warnings };
}
