import { z } from "zod";

export const DEFAULT_ACCENT = "#4B3FE4";

export const platformSchema = z.enum(["instagram", "facebook", "linkedin", "tiktok"]);

export const brandStatusSchema = z.enum(["active", "archived"]);

/** Where a brand currently sits in the agent loop. */
export const loopStageSchema = z.enum([
  "onboarding",
  "strategy",
  "content",
  "approval",
  "publishing",
  "learning",
]);

export const brandColorSchema = z.object({
  name: z.string(),
  hex: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Use a hex colour such as #3B2F2F"),
});

export const brandKitSchema = z.object({
  tagline: z.string(),
  summary: z.string(),
  audience: z.string(),
  /** The brand tone, e.g. ["warm", "direct"]. */
  voice: z.array(z.string()),
  colors: z.array(brandColorSchema),
  fonts: z.object({ heading: z.string(), body: z.string() }),
  /** The visual feel, e.g. "minimal, earthy, lots of white space". */
  aesthetic: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

/** A local clock time, read in the brand's timezone. */
export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24 hour HH:mm");

export const weekdaySchema = z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);

export const businessHoursEntrySchema = z.object({
  day: weekdaySchema,
  open: timeSchema,
  close: timeSchema,
});

/** Contact details the agents can use in posts. A day with no hours entry is closed. */
export const businessInfoSchema = z.object({
  phone: z.string().optional(),
  email: z.email().optional(),
  location: z
    .object({
      address: z.string().optional(),
      city: z.string().optional(),
      region: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  hours: z.array(businessHoursEntrySchema).optional(),
});

export const brandPreferencesSchema = z.object({
  /** IANA name, e.g. "Asia/Kolkata". */
  timezone: z.string().min(1),
  approvalEmails: z.boolean(),
});

export const DEFAULT_PREFERENCES: z.infer<typeof brandPreferencesSchema> = {
  timezone: "UTC",
  approvalEmails: true,
};

export const socialAccountSchema = z.object({
  platform: platformSchema,
  handle: z.string(),
  status: z.enum(["connected", "expired"]),
  connectedAt: z.string(),
});

export const brandStatsSchema = z.object({
  followers: z.number(),
  followersDelta: z.number(),
  engagementRate: z.number(),
  engagementDelta: z.number(),
  scheduled: z.number(),
  pendingApprovals: z.number(),
});

// "acme.com:8080" reads as scheme "acme.com" followed by ":" under a loose scheme regex, so a
// scheme is only recognised when it is followed by "//" (ftp://, http://) or is one of the
// non-web schemes below that never use "//" (mailto:, javascript:, ...). Anything else, including
// a bare host:port, is treated as schemeless and gets https:// prepended.
/**
 * True when the text already says how to reach it ("http://", "ftp://", "mailto:", "//host").
 * Only plain addresses such as "acme.com" or "acme.com:8080" get "https://" added in front.
 */
const hasScheme = (value: string) =>
  /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ||
  /^(mailto|tel|sms|javascript|data):/i.test(value) ||
  value.startsWith("//");

/** A website address as a person types it. "acme.com" becomes "https://acme.com". */
export const websiteUrlSchema = z
  .string()
  .trim()
  .min(1)
  .transform((value) => (hasScheme(value) ? value : `https://${value}`))
  .refine((value) => {
    try {
      const url = new URL(value);
      return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
    } catch {
      return false;
    }
  }, "Enter a website address such as acme.com");

export const newBrandSchema = z.object({
  name: z.string().trim().min(1),
  url: websiteUrlSchema,
  industry: z.string().trim(),
  brand: brandKitSchema,
  platforms: z.array(platformSchema),
  business: businessInfoSchema.optional(),
  /** The onboarding scan this brand came from. Phase 2: links the scan to the brand. */
  scanId: z.uuid().optional(),
});

/** The parts of a brand its owner can change in Settings. Unknown keys are dropped. */
export const brandPatchSchema = z.object({
  name: z.string().trim().min(1).optional(),
  industry: z.string().trim().optional(),
  brand: brandKitSchema.optional(),
  business: businessInfoSchema.optional(),
  platforms: z.array(platformSchema).optional(),
  preferences: brandPreferencesSchema.optional(),
});

export const brandSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  /** Who set the brand up: the owner, or an admin on their behalf. */
  createdBy: z.string(),
  name: z.string(),
  url: z.string(),
  industry: z.string(),
  accent: z.string(),
  status: brandStatusSchema,
  stage: loopStageSchema,
  brand: brandKitSchema,
  business: businessInfoSchema,
  platforms: z.array(platformSchema),
  accounts: z.array(socialAccountSchema),
  preferences: brandPreferencesSchema,
  createdAt: z.string(),
  stats: brandStatsSchema,
});
