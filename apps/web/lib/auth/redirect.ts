import { routes } from "@/config/routes";
export const REDIRECT_PARAM = "redirect_url";

/**
 * Keeps a post-sign-in destination on this site. Absolute URLs (the proxy sends
 * one) are cut down to their path, and protocol-relative paths are refused.
 */
export function safeRedirect(value: string | string[] | undefined, fallback = routes.home): string {
  if (typeof value !== "string" || value === "") return fallback;
  try {
    const url = new URL(value, "http://local");
    const path = `${url.pathname}${url.search}${url.hash}`;
    return path.startsWith("//") ? fallback : path;
  } catch {
    return fallback;
  }
}

/** Carries the destination on to the next auth screen, leaving the default out of the URL. */
export function withRedirect(path: string, redirectTo: string): string {
  if (redirectTo === routes.home) return path;
  const params = new URLSearchParams({ [REDIRECT_PARAM]: redirectTo });
  return `${path}?${params}`;
}
