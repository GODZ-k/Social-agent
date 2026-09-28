import { z } from "zod";
import type { Platform } from "@social-agent/shared";
import type { PlatformSignal, ScanResult } from "@/lib/types";
import { PLATFORMS } from "@/features/brand-kit/schema";
import { isValidHex } from "@/lib/utils";
import { TYPEFACE_OPTIONS, type TypefaceId } from "@/features/onboarding/typeface-picker";

/** FL-1's capture: the whole kit needed to draft a brand without a site to read. */
export const manualKitSchema = z.object({
  name: z.string().trim().min(1, "Give the business a name."),
  industry: z.string().trim(),
  summary: z.string().trim().min(10, "Say a sentence or two about what you sell or offer."),
  website: z.string().trim(),
  tagline: z.string().trim(),
  audience: z.string().trim().min(1, "Describe who the posts are for."),
  voice: z.array(z.string()).min(1, "Pick at least one word for how you sound."),
  colors: z
    .array(z.object({ name: z.string().trim().min(1, "Name this colour."), hex: z.string().refine(isValidHex, "Use a hex colour, like #2F6FDE.") }))
    .min(1)
    .max(5),
  typeface: z.enum(["clean", "warm", "friendly"]),
  contactPhone: z.string().trim(),
  contactEmail: z.string().trim().refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Use a valid email address."),
  contactAddress: z.string().trim(),
  hoursEnabled: z.boolean(),
  contactHours: z.string().trim(),
  platforms: z.array(z.enum(PLATFORMS)).min(1, "Choose at least one place to post."),
});

export type ManualValues = z.infer<typeof manualKitSchema>;

/** Instagram and the two friendliest tone words start ticked; everything stays editable (FL-1, decided). */
export const MANUAL_DEFAULT_VALUES: ManualValues = {
  name: "",
  industry: "",
  summary: "",
  website: "",
  tagline: "",
  audience: "",
  voice: ["Friendly", "Straightforward"],
  colors: [
    { name: "Indigo", hex: "#4B3FE4" },
    { name: "Paper", hex: "#F7F7FA" },
    { name: "Ink", hex: "#1C2433" },
  ],
  typeface: "clean",
  contactPhone: "",
  contactEmail: "",
  contactAddress: "",
  hoursEnabled: false,
  contactHours: "",
  platforms: ["instagram"],
};

function fontsFor(typeface: TypefaceId): { heading: string; body: string } {
  const option = TYPEFACE_OPTIONS.find((t) => t.id === typeface) ?? TYPEFACE_OPTIONS[0];
  return { heading: option.heading, body: option.body };
}

/** Turns the form's answers into the same shape a brand scan returns, so it hands off to the
 * same review step (S17a) a successful scan uses, instead of a special-cased manual path. */
export function toScanResult(values: ManualValues): ScanResult {
  const platformSignals = Object.fromEntries(
    values.platforms.map((platform): [Platform, PlatformSignal] => [
      platform,
      { handle: "Not connected yet", source: "you'll link it in the next step" },
    ]),
  ) as Partial<Record<Platform, PlatformSignal>>;

  return {
    name: values.name,
    industry: values.industry || "Local business",
    brand: {
      tagline: values.tagline,
      summary: values.summary,
      audience: values.audience,
      voice: values.voice,
      colors: values.colors,
      fonts: fontsFor(values.typeface),
    },
    business: {
      email: values.contactEmail || undefined,
      phone: values.contactPhone || undefined,
      location: values.contactAddress ? { address: values.contactAddress } : undefined,
      // Hours edit as one free-text line here; BusinessInfo.hours is per-day, so it isn't carried forward yet
      // (same limitation as brand-kit/schema.ts's toBusinessInfo).
    },
    platformSignals,
  };
}
