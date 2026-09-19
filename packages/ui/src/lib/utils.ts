import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const whole = new Intl.NumberFormat("en");

export const formatCompact = (n: number) => compact.format(n);
export const formatNumber = (n: number) => whole.format(n);
export const formatDelta = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

function channels(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function luminance(hex: string) {
  const [r, g, b] = channels(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Ink or white, whichever reads better on top of `hex`. */
export function readableOn(hex: string) {
  return luminance(hex) > 0.42 ? "#1a1d26" : "#ffffff";
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

function mix(hex: string, toward: string, amount: number) {
  const from = channels(hex);
  const to = channels(toward);
  return "#" + from.map((c, i) => Math.round(c + (to[i]! - c) * amount).toString(16).padStart(2, "0")).join("");
}

/**
 * The brand colour, nudged toward `toward` only as far as it takes to read as
 * text on `surface`. A navy brand is returned untouched on white; a yellow one
 * is deepened until it passes. Keeps the hue, so it still reads as "theirs".
 */
function legibleOn(hex: string, surface: string, toward: string, target = 4.5) {
  for (let amount = 0; amount <= 1; amount += 0.05) {
    const candidate = mix(hex, toward, amount);
    if (contrast(candidate, surface) >= target) return candidate;
  }
  return toward;
}

/** The custom properties that tint a subtree (or the document) to a client's brand. */
export const BRAND_PROPERTIES = ["--brand", "--brand-foreground", "--brand-ink-light", "--brand-ink-dark"] as const;

export function brandProperties(hex: string): Record<(typeof BRAND_PROPERTIES)[number], string> {
  return {
    // Fills (buttons, avatars, bars) use the true brand colour, with ink or white on top.
    "--brand": hex,
    "--brand-foreground": readableOn(hex),
    // Text and icons use a contrast-safe version, one per colour scheme.
    "--brand-ink-light": legibleOn(hex, "#ffffff", "#1a1d26"),
    "--brand-ink-dark": legibleOn(hex, "#171a21", "#ffffff"),
  };
}

export function brandStyle(hex: string): React.CSSProperties {
  return brandProperties(hex) as React.CSSProperties;
}

export function isValidHex(value: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}
