// The product name and logo are undecided. Everything reads the name from here.
export const APP_NAME = "Cadence";

/** Where the product itself runs. Sign-in, sign-up and the URL form all lead here. */
export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
/** This site's own origin, for the sitemap and canonical URLs. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001").replace(/\/$/, "");

export const signInUrl = `${APP_URL}/sign-in`;
/** Carries the visitor's website along, so onboarding can start reading it straight after sign-up. */
export const signUpUrl = (url?: string) =>
  url ? `${APP_URL}/sign-up?url=${encodeURIComponent(url)}` : `${APP_URL}/sign-up`;

export const NAV = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

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
