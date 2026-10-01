// Design-system helpers (cn, formatters, brand colour maths) live in the shared UI
// package. Re-exported here so app code has one place to import utilities from.
export * from "@repo/ui/lib/utils";

import type { Platform } from "@social-agent/shared";
import type { Brand } from "./types";

export const APP_NAME = "Cadence";

const listFormat = new Intl.ListFormat("en", { type: "conjunction" });

/** "a, b and c", English conjunction style. One instance shared by every "X and Y aren't connected" line. */
export function formatList(items: string[]): string {
  return listFormat.format(items);
}

/** The brand's platforms with no connected social account. */
export function unconnectedPlatforms(brand: Brand): Platform[] {
  return brand.platforms.filter((p) => brand.accounts.find((a) => a.platform === p)?.status !== "connected");
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
