import "server-only";
import { BRAND_SCAN_STEPS } from "@/lib/scan-steps";
import type { BrandKit } from "@social-agent/shared";
import type { Scan } from "@/lib/types";

/**
 * A mock of the API's scan job. `POST /scans` becomes `start`, `GET /scans/:id`
 * becomes `read`, and progress is a function of elapsed time so polling sees
 * one step complete roughly every second.
 */
const STEP_MS = 1100;

declare global {
  var __cadenceMockScans: Map<string, { url: string; ownerId: string; startedAt: number }> | undefined;
}

const scans = () => (globalThis.__cadenceMockScans ??= new Map());

export function start(url: string, ownerId: string): string {
  const id = `scan_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  scans().set(id, { url, ownerId, startedAt: Date.now() });
  return id;
}

export function read(id: string, ownerId: string): Scan | null {
  const job = scans().get(id);
  if (!job || job.ownerId !== ownerId) return null;
  const step = Math.min(Math.floor((Date.now() - job.startedAt) / STEP_MS), BRAND_SCAN_STEPS.length);
  const done = step === BRAND_SCAN_STEPS.length;
  // draftBrandKit depends only on the url, so the preview exists from the first poll.
  const preview = draftBrandKit(job.url);
  return {
    id,
    url: job.url,
    step,
    status: done ? "done" : "running",
    result: done ? preview : null,
    preview,
  };
}

function draftBrandKit(url: string): NonNullable<Scan["result"]> {
  const host = new URL(url).hostname.replace(/^www\./, "");
  const stem = host.split(".")[0] ?? host;
  const name = stem
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const brand: BrandKit = {
    tagline: `What ${name} is known for, in one line`,
    summary: `${name} sells directly to customers through ${host}. The site is product-led with a friendly, straightforward tone and a small, consistent colour palette.`,
    audience: "Local customers, 25–45, who discover brands on Instagram",
    voice: ["Friendly", "Straightforward", "Confident"],
    colors: [
      { name: "Primary", hex: "#2F6FDE" },
      { name: "Background", hex: "#F2F5FA" },
      { name: "Ink", hex: "#1C2433" },
      { name: "Highlight", hex: "#F2B441" },
    ],
    fonts: { heading: "Poppins", body: "Inter" },
  };
  return {
    name,
    industry: "Local business",
    brand,
    // Phone and opening hours are never on a site like this one, so the review still shows "Not on your site" for them.
    business: { email: `hello@${host}`, location: { city: "Portland", region: "OR", country: "US" } },
    sources: {
      summary: "Found on your About page",
      audience: "Found on your product pages",
      colors: "Found on your homepage",
      email: "Found on your Contact page",
      address: "Found on your Contact page",
    },
    platformSignals: {
      instagram: { handle: `@${stem}`, source: "linked on your site" },
      facebook: { handle: name, source: "linked on your site" },
    },
  };
}
