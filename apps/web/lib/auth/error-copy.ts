import { AUTH_POLICY } from "./rules";
import { APP_NAME } from "@/lib/utils";
import type { AuthErrorCode } from "./types";

// What we say for each auth error. Wording follows docs/DESIGN.md: plain, specific, and
// never revealing whether an email has an account.
const COPY: Record<AuthErrorCode, string> = {
  wrong_credentials: "That email and password don't match. Check both, or reset your password.",
  email_in_use: "This email can't be used for a new account. Sign in, or reset your password.",
  code_wrong: `That code isn't right. Check the newest email from ${APP_NAME} and try again.`,
  code_expired: `This code has expired. Codes work for ${AUTH_POLICY.codeMinutes} minutes. Send a new one to carry on.`,
  too_many_attempts: `Too many tries. Wait ${AUTH_POLICY.lockMinutes} minutes, then try again.`,
  link_expired: `This link no longer works. Links work once, for ${AUTH_POLICY.resetLinkMinutes} minutes.`,
  invite_used: "This invite was already used. Sign in with the email it came to.",
  password_too_short: `Use at least ${AUTH_POLICY.minPasswordLength} characters.`,
  password_leaked: "This password shows up in known data leaks, so it is easy to guess. Try a short phrase only you would know.",
  passkey_cancelled: "The passkey wasn't created. The prompt was closed or timed out. Nothing changed on your device.",
  not_supported: `This isn't available yet. Contact ${APP_NAME} support and we'll help.`,
  unknown: "Something went wrong on our side. Try again in a moment.",
};

export function errorCopy(code: AuthErrorCode): string {
  return COPY[code];
}
