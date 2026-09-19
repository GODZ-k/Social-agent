import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const APP_NAME = "Cadence";

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

/** CSS custom properties that tint a subtree to a client's brand colour. */
export function brandStyle(hex: string): React.CSSProperties {
  return {
    "--brand": hex,
    "--brand-foreground": readableOn(hex),
  } as React.CSSProperties;
}

export function isValidHex(value: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}

/** Accepts "acme.com" as well as a full URL; returns null when it can't be a site. */
export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    if (!url.hostname.includes(".")) return null;
    return url.origin + (url.pathname === "/" ? "" : url.pathname);
  } catch {
    return null;
  }
}

export const prettyUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
