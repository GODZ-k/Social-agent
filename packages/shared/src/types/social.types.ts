import type { z } from "zod";
import type {
  activeHoursSchema,
  audienceDemographicsSchema,
  connectErrorSchema,
  connectSocialAccountResponseSchema,
  connectSocialAccountSchema,
  socialAccountDetailSchema,
  socialAccountStatusSchema,
} from "../schema/social.schema.js";

export type SocialAccountStatus = z.infer<typeof socialAccountStatusSchema>;
export type SocialAccountDetail = z.infer<typeof socialAccountDetailSchema>;
export type ConnectSocialAccountInput = z.infer<typeof connectSocialAccountSchema>;
export type ConnectError = z.infer<typeof connectErrorSchema>;
export type ConnectSocialAccountResponse = z.infer<typeof connectSocialAccountResponseSchema>;
export type ActiveHours = z.infer<typeof activeHoursSchema>;
export type AudienceDemographics = z.infer<typeof audienceDemographicsSchema>;
