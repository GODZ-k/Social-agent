import type { AuthError, AuthErrorCode, TwoFactorMethod } from "./types";

// Product rules that hold whatever the provider is (docs/DESIGN_TRACKER.md, sections 5 and 8).
export const AUTH_POLICY = {
  minPasswordLength: 10,
  codeLength: 6,
  codeMinutes: 10,
  resetLinkMinutes: 30,
  inviteDays: 7,
  lockMinutes: 15,
  resendSeconds: 60,
} as const;

export type RuleState = "pending" | "met" | "fail";

export interface PasswordRules {
  length: RuleState;
  notLeaked: RuleState;
  notEmail: RuleState;
}

/**
 * The live password checklist. Length and "not your email" are checked as the
 * person types; "not leaked" is only known once the provider has checked it, so
 * it stays pending until `leaked` is set.
 */
export function checkPassword(password: string, email: string, leaked?: boolean): PasswordRules {
  const typed = password.length > 0;
  const lowered = password.toLowerCase();
  const emailName = email.split("@")[0]?.toLowerCase() ?? "";
  const usesEmail = email !== "" && (lowered.includes(email.toLowerCase()) || (emailName.length >= 4 && lowered.includes(emailName)));
  return {
    length: ruleState(typed, password.length >= AUTH_POLICY.minPasswordLength),
    notLeaked: leaked === undefined ? "pending" : leaked ? "fail" : "met",
    notEmail: ruleState(typed, !usesEmail),
  };
}

function ruleState(typed: boolean, passes: boolean): RuleState {
  if (!typed) return "pending";
  return passes ? "met" : "fail";
}

export function passwordAllowed(rules: PasswordRules): boolean {
  return rules.length === "met" && rules.notEmail === "met" && rules.notLeaked !== "fail";
}

const PASSWORD_ERROR_CODES = new Set<AuthErrorCode>(["password_too_short", "password_leaked"]);

/** Splits a submit error into "about the password" (ticked live against the rules) from everything else (a banner). */
export function passwordErrorFrom(error: AuthError | null): AuthError | null {
  return error && PASSWORD_ERROR_CODES.has(error.code) ? error : null;
}

/**
 * Admins must always keep one second-factor method; clients may turn two-factor off.
 * The server still redirects an admin without two-factor to setup, so this is not the only guard.
 */
export function canRemoveMethod(methods: readonly TwoFactorMethod[], isAdmin: boolean): boolean {
  return !isAdmin || methods.length > 1;
}
