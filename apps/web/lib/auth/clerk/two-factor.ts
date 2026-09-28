"use client";

import { useReverification, useSignIn, useUser } from "@clerk/nextjs";
import type { UserResource } from "@clerk/nextjs/types";
import { done, fail, failWith, succeed } from "./errors";
import { useFinishNavigation, useMounted } from "./shared";
import type { AuthenticatorSetup, AuthResult, AuthStep, BackupCodesStatus, TwoFactorMethod } from "../types";

const AUTHENTICATOR_ID = "authenticator_app";

function requireUser(user: UserResource | null | undefined): UserResource {
  if (!user) throw new Error("Not signed in");
  return user;
}

/** Codes are shown and typed with an optional dash; Clerk wants them bare. */
function bareCode(code: string): string {
  return code.replace(/[\s-]/g, "").toLowerCase();
}

// ---------- The second step of sign-in ----------

export function useTwoFactorSignIn({ redirectTo }: { redirectTo: string }) {
  const { signIn } = useSignIn();
  const mounted = useMounted();
  const finishTo = useFinishNavigation();

  async function finishIfComplete(): Promise<AuthResult<AuthStep>> {
    if (signIn.status !== "complete") return failWith("unknown");
    const finish = finishTo(redirectTo);
    const { error } = await signIn.finalize({ navigate: finish });
    return error ? fail(error) : succeed("done");
  }

  async function verifyAppCode(code: string): Promise<AuthResult<AuthStep>> {
    const { error } = await signIn.mfa.verifyTOTP({ code });
    if (error) return fail(error);
    return finishIfComplete();
  }

  async function verifyBackupCode(code: string): Promise<AuthResult<AuthStep>> {
    const { error } = await signIn.mfa.verifyBackupCode({ code: bareCode(code) });
    if (error) return fail(error);
    return finishIfComplete();
  }

  async function verifyPasskey(): Promise<AuthResult<AuthStep>> {
    return failWith("not_supported");
  }

  return {
    ready: mounted,
    hasPending: mounted && signIn.status === "needs_second_factor",
    email: signIn.identifier,
    /** Clerk does not say how many backup codes are left, so the "running low" screen never shows. */
    backupCodesLeft: null as number | null,
    verifyAppCode,
    verifyBackupCode,
    verifyPasskey,
  };
}

// ---------- Turning two-factor on ----------

export function useTwoFactorSetup() {
  const { user } = useUser();
  // Clerk asks the person to confirm who they are (its own modal) when the session is not fresh.
  const createTOTP = useReverification(() => requireUser(user).createTOTP());
  const createBackupCode = useReverification(() => requireUser(user).createBackupCode());

  async function startAuthenticatorApp(): Promise<AuthResult<AuthenticatorSetup>> {
    try {
      const totp = await createTOTP();
      if (!totp.secret || !totp.uri) return failWith("unknown");
      return succeed({ secret: totp.secret, uri: totp.uri });
    } catch (error) {
      return fail(error);
    }
  }

  /** Confirms the first code from the app and returns the backup codes to show once. */
  async function confirmAuthenticatorApp(code: string): Promise<AuthResult<string[]>> {
    try {
      const totp = await requireUser(user).verifyTOTP({ code });
      if (totp.backupCodes?.length) return succeed(totp.backupCodes);
      const backup = await createBackupCode();
      return succeed(backup.codes);
    } catch (error) {
      return fail(error);
    }
  }

  async function createPasskey(): Promise<AuthResult> {
    return failWith("not_supported");
  }

  return { startAuthenticatorApp, confirmAuthenticatorApp, createPasskey };
}

// ---------- Managing methods from the account page ----------

function methodsOf(user: UserResource | null | undefined): TwoFactorMethod[] {
  if (!user?.totpEnabled) return [];
  return [{ id: AUTHENTICATOR_ID, kind: "authenticator_app", name: null, addedAt: null, lastUsedAt: null }];
}

export function useTwoFactorMethods() {
  const { user, isLoaded } = useUser();
  const disableTOTP = useReverification(() => requireUser(user).disableTOTP());
  const createBackupCode = useReverification(() => requireUser(user).createBackupCode());

  async function removeMethod(id: string): Promise<AuthResult> {
    if (id !== AUTHENTICATOR_ID) return failWith("not_supported");
    try {
      await disableTOTP();
      return done;
    } catch (error) {
      return fail(error);
    }
  }

  /** Replaces every backup code; the old ones stop working at once. */
  async function makeNewBackupCodes(): Promise<AuthResult<string[]>> {
    try {
      const backup = await createBackupCode();
      return succeed(backup.codes);
    } catch (error) {
      return fail(error);
    }
  }

  const backupCodes: BackupCodesStatus = { enabled: user?.backupCodeEnabled ?? false, remaining: null };

  return { ready: isLoaded, methods: methodsOf(user), backupCodes, removeMethod, makeNewBackupCodes };
}
