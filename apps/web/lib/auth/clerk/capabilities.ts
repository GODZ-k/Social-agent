import type { AuthCapabilities } from "@/lib/auth/types";

/**
 * Clerk sends reset codes, not links. Its passkeys are a first sign-in step, not
 * a second factor, so two-factor here is the authenticator app plus backup codes.
 * Clerk does not report how many backup codes are left.
 * Google shows only when it is switched on in the Clerk dashboard and flagged here.
 */
export const authCapabilities: AuthCapabilities = {
  passwordReset: "code",
  secondFactors: ["authenticator_app"],
  countsBackupCodes: false,
  google: process.env.NEXT_PUBLIC_AUTH_GOOGLE === "on",
};
