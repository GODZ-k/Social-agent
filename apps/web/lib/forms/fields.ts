import { z } from "zod";
import type { BusinessInfo, Platform } from "@social-agent/shared";
import { isValidHex } from "@/lib/utils";

export const PLATFORMS = ["instagram", "facebook", "tiktok", "linkedin"] as const satisfies readonly Platform[];
export const VOICE_SUGGESTIONS = ["Friendly", "Straightforward", "Confident", "Playful", "Expert", "Warm", "Witty", "Calm", "Bold"];

/** One brand colour. Both kit forms capture it the same way; only how many they allow differs. */
export const brandColor = z.object({
  name: z.string().trim().min(1, "Name this colour."),
  hex: z.string().refine(isValidHex, "Use a hex colour, like #2F6FDE."),
});

/** An email that may be left blank, because the site need not have published one. */
export const optionalEmail = z
  .string()
  .trim()
  .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Use a valid email address.");

/** The contact block both kit forms carry, spread into each one's shape. */
export const contactFields = {
  contactEmail: optionalEmail,
  contactPhone: z.string().trim(),
  contactAddress: z.string().trim(),
  contactHours: z.string().trim(),
};

/**
 * The contact facts posts quote exactly; a blank field means the site never said.
 *
 * Hours edit as one free-text line in both forms, while `BusinessInfo.hours` is per-day, so they
 * are not carried back yet.
 */
export function toBusinessInfo(values: { contactEmail: string; contactPhone: string; contactAddress: string }): BusinessInfo {
  return {
    email: values.contactEmail || undefined,
    phone: values.contactPhone || undefined,
    location: values.contactAddress ? { address: values.contactAddress } : undefined,
  };
}
