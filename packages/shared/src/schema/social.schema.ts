import { z } from "zod";
import { weekdaySchema } from "./brand.schema.js";

export const socialAccountStatusSchema = z.enum(["connected", "expired", "disconnected"]);

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
export type ActiveHours = z.infer<typeof activeHoursSchema>;
export type AudienceDemographics = z.infer<typeof audienceDemographicsSchema>;
