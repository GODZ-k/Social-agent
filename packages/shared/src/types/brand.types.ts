import type { z } from "zod";
import type {
  brandColorSchema,
  brandKitSchema,
  brandPatchSchema,
  brandPreferencesSchema,
  brandSchema,
  brandStatsSchema,
  brandStatusSchema,
  businessInfoSchema,
  loopStageSchema,
  newBrandSchema,
  platformSchema,
  socialAccountSchema,
  weekdaySchema,
} from "../schema/brand.schema.js";

export type Platform = z.infer<typeof platformSchema>;
export type Weekday = z.infer<typeof weekdaySchema>;
export type BrandStatus = z.infer<typeof brandStatusSchema>;
export type LoopStage = z.infer<typeof loopStageSchema>;
export type BrandColor = z.infer<typeof brandColorSchema>;
export type BrandKit = z.infer<typeof brandKitSchema>;
export type BusinessInfo = z.infer<typeof businessInfoSchema>;
export type BrandPreferences = z.infer<typeof brandPreferencesSchema>;
export type SocialAccount = z.infer<typeof socialAccountSchema>;
export type BrandStats = z.infer<typeof brandStatsSchema>;
export type NewBrandInput = z.infer<typeof newBrandSchema>;
export type BrandPatch = z.infer<typeof brandPatchSchema>;
export type Brand = z.infer<typeof brandSchema>;
