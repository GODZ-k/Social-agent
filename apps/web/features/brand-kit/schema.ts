import { z } from "zod";
import type { BrandKit, BusinessInfo, Platform } from "@social-agent/shared";
import type { ClientPatch, NewClientInput, ScanResult } from "@/lib/types";
import { isValidHex } from "@/lib/utils";

export const PLATFORMS = ["instagram", "facebook", "tiktok", "linkedin"] as const satisfies readonly Platform[];
export const VOICE_SUGGESTIONS = ["Friendly", "Straightforward", "Confident", "Playful", "Expert", "Warm", "Witty", "Calm", "Bold"];

export const brandKitSchema = z.object({
  name: z.string().trim().min(1, "Give the business a name."),
  industry: z.string().trim().min(1, "Say what kind of business this is."),
  tagline: z.string().trim().max(120, "Keep the tagline under 120 characters."),
  summary: z.string().trim().min(20, "Add a sentence or two so the agent knows what they sell."),
  audience: z.string().trim().min(1, "Describe who the posts are for."),
  voice: z.array(z.string()).min(1, "Pick at least one word for how they sound."),
  colors: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Name this colour."),
        hex: z.string().refine(isValidHex, "Use a hex colour, like #2F6FDE."),
      }),
    )
    .min(1, "Keep at least one brand colour."),
  headingFont: z.string().trim().min(1, "Name the heading typeface."),
  bodyFont: z.string().trim().min(1, "Name the body typeface."),
  platforms: z.array(z.enum(PLATFORMS)).min(1, "Choose at least one place to publish."),
  contactEmail: z.string().trim().refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Use a valid email address."),
  contactPhone: z.string().trim(),
  contactAddress: z.string().trim(),
  contactHours: z.string().trim(),
});

export type Values = z.infer<typeof brandKitSchema>;

/** "123 Main St, Portland, OR, US" from whichever parts the scan found. */
function formatAddress(location: BusinessInfo["location"]): string {
  if (!location) return "";
  return [location.address, location.city, location.region, location.country].filter(Boolean).join(", ");
}

/** The form's starting values from what the scan found, or from a saved client. */
export function toValues(scan: ScanResult, platforms: Platform[]): Values {
  const business = scan.business;
  return {
    name: scan.name,
    industry: scan.industry,
    tagline: scan.brand.tagline,
    summary: scan.brand.summary,
    audience: scan.brand.audience,
    voice: scan.brand.voice,
    colors: scan.brand.colors,
    headingFont: scan.brand.fonts.heading,
    bodyFont: scan.brand.fonts.body,
    platforms: platforms.filter((p): p is (typeof PLATFORMS)[number] => (PLATFORMS as readonly string[]).includes(p)),
    contactEmail: business?.email ?? "",
    contactPhone: business?.phone ?? "",
    contactAddress: formatAddress(business?.location),
    contactHours: business?.hours?.length ? business.hours.map((h) => `${h.day} ${h.open}-${h.close}`).join(", ") : "",
  };
}

function toBrandKit(values: Values): BrandKit {
  return {
    tagline: values.tagline,
    summary: values.summary,
    audience: values.audience,
    voice: values.voice,
    colors: values.colors,
    fonts: { heading: values.headingFont, body: values.bodyFont },
  };
}

/** The contact facts posts quote exactly; empty fields mean the site never said. */
function toBusinessInfo(values: Values): BusinessInfo {
  return {
    email: values.contactEmail || undefined,
    phone: values.contactPhone || undefined,
    location: values.contactAddress ? { address: values.contactAddress } : undefined,
    // Hours edit as one free-text line here; BusinessInfo.hours is per-day, so it isn't saved back yet.
  };
}

/** What Settings sends when the kit changes. */
export function toPatch(values: Values): Required<Pick<ClientPatch, "name" | "industry" | "brand" | "platforms" | "business">> {
  return {
    name: values.name,
    industry: values.industry,
    platforms: values.platforms,
    brand: toBrandKit(values),
    business: toBusinessInfo(values),
  };
}

/** What onboarding sends to create the client. */
export function toInput(values: Values, url: string): NewClientInput {
  return { url, ...toPatch(values) };
}
