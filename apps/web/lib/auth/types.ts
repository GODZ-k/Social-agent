// Our own auth vocabulary. Components and pages use only these types, never a
// provider's, so swapping the provider behind `lib/auth/client.ts` and
// `lib/auth/server.ts` changes no component.

/** Why an auth call failed, in our words. Each adapter maps its provider's errors onto these. */
export type AuthErrorCode =
  | "wrong_credentials"
  | "email_in_use"
  | "code_wrong"
  | "code_expired"
  | "too_many_attempts"
  | "link_expired"
  | "invite_used"
  | "password_too_short"
  | "password_leaked"
  | "passkey_cancelled"
  | "not_supported"
  | "unknown";

export interface AuthError {
  code: AuthErrorCode;
  /** Set with `too_many_attempts` when the provider says how long the pause lasts. */
  retryAfterSeconds?: number;
}

export type AuthResult<T = void> = { ok: true; data: T } | { ok: false; error: AuthError };

/**
 * Where a sign-in, sign-up or code check leaves the person. `done` means the
 * session is active and the adapter is already navigating to `redirectTo`.
 */
export type AuthStep = "done" | "verify-email" | "two-factor" | "set-up-two-factor";

export type TwoFactorMethodKind = "authenticator_app" | "passkey";

export interface TwoFactorMethod {
  id: string;
  kind: TwoFactorMethodKind;
  /** Passkeys carry the device name; the authenticator app has none. */
  name: string | null;
  addedAt: Date | null;
  lastUsedAt: Date | null;
}

export interface BackupCodesStatus {
  enabled: boolean;
  /** Null when the provider does not say how many are left. */
  remaining: number | null;
}

export interface AuthenticatorSetup {
  /** The base32 secret, for typing into the app by hand. */
  secret: string;
  /** The `otpauth://` link that opens the authenticator app on a phone. */
  uri: string;
}

/** What the current provider can do. Components read this instead of knowing the provider. */
export interface AuthCapabilities {
  /** "code": the reset email carries a code typed on our page. "link": it carries a link to /reset-password. */
  passwordReset: "code" | "link";
  /** Which second-factor methods can be set up and used at sign-in. */
  secondFactors: readonly TwoFactorMethodKind[];
  /** Whether the provider reports how many backup codes are left. */
  countsBackupCodes: boolean;
  google: boolean;
}

/** The signed-in person as the provider knows them, before the app decides their role. */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  /** The role stored with the provider's user, if any. */
  role: string | null;
  twoFactorEnabled: boolean;
}

export type InviteState =
  | { status: "loading" }
  | { status: "ready"; email: string }
  | { status: "used" }
  | { status: "expired" };
