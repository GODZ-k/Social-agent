// Design-system helpers (cn, formatters, brand colour maths) live in the shared UI
// package. Re-exported here so app code has one place to import utilities from.
export * from "@repo/ui/lib/utils";

export const APP_NAME = "Cadence";

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
