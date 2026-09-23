import { z } from "zod";
import { platformSchema, weekdaySchema } from "./brand.schema.js";

export const socialAccountStatusSchema = z.enum(["connected", "expired", "disconnected"]);

/** One account as Settings sees it. Tokens, `meta` and the external id never appear. */
export const socialAccountDetailSchema = z.object({
  id: z.uuid(),
  platform: platformSchema,
  handle: z.string(),
  avatarUrl: z.string().nullable(),
  status: socialAccountStatusSchema,
  scopes: z.array(z.string()),
  tokenExpiresAt: z.string().nullable(),
  connectedBy: z.uuid(),
  connectedAt: z.string(),
  lastSyncedAt: z.string().nullable(),
});

export const connectSocialAccountSchema = z.object({ platform: platformSchema });

/** `connect_error` on the settings URL after a failed connect. */
export const connectErrorSchema = z.enum([
  "denied",
  "invalid_state",
  "account_in_use",
  "account_mismatch",
  "missing_scopes",
  "failed",
]);

export const connectSocialAccountResponseSchema = z.object({ authorizeUrl: z.url() });

/** Followers online per hour (24 numbers, hour 0 first) for each day the platform reports. */
export const activeHoursSchema = z.partialRecord(weekdaySchema, z.array(z.number()).length(24));

/** One slice of the audience, e.g. { label: "Pune", share: 0.31 }. `share` is 0-1. */
export const audienceShareSchema = z.object({
  label: z.string(),
  share: z.number().min(0).max(1),
});

/** Each network reports a different subset, so every group is optional. */
export const audienceDemographicsSchema = z.object({
  countries: z.array(audienceShareSchema).optional(),
  cities: z.array(audienceShareSchema).optional(),
  ageGender: z.array(audienceShareSchema).optional(),
  industries: z.array(audienceShareSchema).optional(),
});

export type SocialAccountStatus = z.infer<typeof socialAccountStatusSchema>;
export type SocialAccountDetail = z.infer<typeof socialAccountDetailSchema>;
export type ConnectSocialAccountInput = z.infer<typeof connectSocialAccountSchema>;
export type ConnectError = z.infer<typeof connectErrorSchema>;
export type ConnectSocialAccountResponse = z.infer<typeof connectSocialAccountResponseSchema>;
export type ActiveHours = z.infer<typeof activeHoursSchema>;
export type AudienceDemographics = z.infer<typeof audienceDemographicsSchema>;
