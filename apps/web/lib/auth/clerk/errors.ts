import { isClerkAPIResponseError, isClerkRuntimeError } from "@clerk/nextjs/errors";
import { AUTH_POLICY } from "@/lib/auth/rules";
import type { AuthError, AuthErrorCode, AuthResult } from "@/lib/auth/types";

// Clerk's error codes, grouped by the one we show. Anything unlisted becomes "unknown".
const CODE_MAP: Record<string, AuthErrorCode> = {
  form_identifier_not_found: "wrong_credentials",
  form_password_incorrect: "wrong_credentials",
  strategy_for_user_invalid: "wrong_credentials",
  form_identifier_exists: "email_in_use",
  form_code_incorrect: "code_wrong",
  verification_failed: "code_wrong",
  verification_expired: "code_expired",
  user_locked: "too_many_attempts",
  too_many_requests: "too_many_attempts",
  form_password_length_too_short: "password_too_short",
  form_password_pwned: "password_leaked",
  form_password_compromised: "password_leaked",
  form_password_not_strong_enough: "password_leaked",
  form_password_validation_failed: "password_leaked",
  passkey_registration_cancelled: "passkey_cancelled",
  passkey_retrieval_cancelled: "passkey_cancelled",
  passkey_operation_aborted: "passkey_cancelled",
};

export function clerkCode(error: unknown): string {
  // Clerk's type guards throw on anything that isn't an object, which would swallow the click silently.
  if (!error || typeof error !== "object") return "";
  if (isClerkAPIResponseError(error)) return error.errors[0]?.code ?? "";
  if (isClerkRuntimeError(error)) return error.code;
  if (error && typeof error === "object" && "code" in error && typeof error.code === "string") return error.code;
  return "";
}

/** Clerk reports ticket problems with several codes; we only need to know expired from used. */
function inviteCode(code: string): AuthErrorCode | null {
  if (!code.includes("ticket") && !code.includes("invitation")) return null;
  return code.includes("expired") ? "link_expired" : "invite_used";
}

export function toAuthError(error: unknown): AuthError {
  const code = clerkCode(error);
  const mapped = CODE_MAP[code] ?? inviteCode(code) ?? "unknown";
  if (mapped !== "too_many_attempts") return { code: mapped };
  const retryAfter = isClerkAPIResponseError(error) ? error.retryAfter : undefined;
  return { code: mapped, retryAfterSeconds: retryAfter ?? AUTH_POLICY.lockMinutes * 60 };
}

export function fail<T>(error: unknown): AuthResult<T> {
  return { ok: false, error: toAuthError(error) };
}

export function failWith<T>(code: AuthErrorCode): AuthResult<T> {
  return { ok: false, error: { code } };
}

export function succeed<T>(data: T): AuthResult<T> {
  return { ok: true, data };
}

export const done: AuthResult = { ok: true, data: undefined };
