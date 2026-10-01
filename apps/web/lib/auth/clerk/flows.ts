"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import type { SignInFutureResource, SignUpFutureResource } from "@clerk/nextjs/types";
import { clerkCode, done, fail, failWith, succeed, toAuthError } from "./errors";
import { forgetPending, readPending, rememberPending, useFinishNavigation, useMounted, type PendingFlow } from "./shared";
import type { AuthResult, AuthStep, InviteState } from "../types";

const SSO_CALLBACK = "/sso-callback";

interface Redirect {
  redirectTo: string;
}

function splitName(name: string): { firstName?: string; lastName?: string } {
  const [firstName, ...rest] = name.trim().split(/\s+/);
  return { firstName: firstName || undefined, lastName: rest.join(" ") || undefined };
}

/** After any sign-in call: activate the session, or say which step comes next. */
async function continueSignIn(
  signIn: SignInFutureResource,
  finish: ReturnType<ReturnType<typeof useFinishNavigation>>,
): Promise<AuthResult<AuthStep>> {
  if (signIn.status === "complete") {
    const { error } = await signIn.finalize({ navigate: finish });
    return error ? fail(error) : succeed("done");
  }
  if (signIn.status === "needs_second_factor") return succeed("two-factor");
  if (signIn.status === "needs_client_trust") {
    // A new device without two-factor: Clerk asks for an emailed code first.
    const { error } = await signIn.mfa.sendEmailCode();
    if (error) return fail(error);
    rememberPending({ email: signIn.identifier ?? "", flow: "sign-in" });
    return succeed("verify-email");
  }
  return failWith("unknown");
}

async function continueSignUp(
  signUp: SignUpFutureResource,
  finish: ReturnType<ReturnType<typeof useFinishNavigation>>,
): Promise<AuthResult<AuthStep>> {
  if (signUp.status !== "complete") return failWith("unknown");
  const { error } = await signUp.finalize({ navigate: finish });
  return error ? fail(error) : succeed("done");
}

// ---------- Sign in ----------

export function useSignInFlow({ redirectTo }: Redirect) {
  const { signIn } = useSignIn();
  const router = useRouter();
  const finishTo = useFinishNavigation();

  // The sign-in page always starts fresh. An unfinished attempt (a password still waiting
  // for its email code) would make the Google button resolve without ever leaving the page.
  const clearUnfinished = useEffectEvent(() => {
    if (signIn.status && signIn.status !== "complete") void signIn.reset();
  });
  useEffect(() => clearUnfinished(), []);

  async function signInWithPassword({ email, password }: { email: string; password: string }): Promise<AuthResult<AuthStep>> {
    const { error } = await signIn.password({ emailAddress: email, password });
    if (clerkCode(error) === "session_exists") {
      router.push(redirectTo);
      return succeed("done");
    }
    if (error) return fail(error);
    const finish = finishTo(redirectTo);
    return continueSignIn(signIn, finish);
  }

  async function signInWithGoogle(): Promise<AuthResult> {
    const { error } = await signIn.sso({ strategy: "oauth_google", redirectUrl: redirectTo, redirectCallbackUrl: SSO_CALLBACK });
    return error ? fail(error) : done;
  }

  return { signInWithPassword, signInWithGoogle };
}

// ---------- Sign up ----------

export function useSignUpFlow({ redirectTo }: Redirect) {
  const { signUp } = useSignUp();

  // Same as sign-in: the page starts fresh so the Google button always leaves for Google.
  const clearUnfinished = useEffectEvent(() => {
    if (signUp.status && signUp.status !== "complete") void signUp.reset();
  });
  useEffect(() => clearUnfinished(), []);

  async function signUpWithPassword({ name, email, password }: { name: string; email: string; password: string }): Promise<AuthResult<AuthStep>> {
    const names = splitName(name);
    const { error } = await signUp.password({ emailAddress: email, password, ...names });
    const authError = error ? toAuthError(error) : null;
    // Never reveal that an email is registered: go to the code step as if it were new.
    if (authError?.code === "email_in_use") {
      rememberPending({ email, flow: "silent" });
      return succeed("verify-email");
    }
    if (authError) return { ok: false, error: authError };
    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) return fail(sendError);
    rememberPending({ email, flow: "sign-up" });
    return succeed("verify-email");
  }

  async function signUpWithGoogle(): Promise<AuthResult> {
    const { error } = await signUp.sso({ strategy: "oauth_google", redirectUrl: redirectTo, redirectCallbackUrl: SSO_CALLBACK });
    return error ? fail(error) : done;
  }

  return { signUpWithPassword, signUpWithGoogle };
}

// ---------- Email code (after sign-up, or a sign-in from a new device) ----------

function currentFlow(signIn: SignInFutureResource, signUp: SignUpFutureResource, pending: PendingFlow | undefined): PendingFlow | null {
  if (signUp.status === "missing_requirements" && signUp.unverifiedFields.includes("email_address")) return "sign-up";
  if (signIn.status === "needs_client_trust") return "sign-in";
  return pending === "silent" ? "silent" : null;
}

export function useEmailVerification({ redirectTo }: Redirect) {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const mounted = useMounted();
  const finishTo = useFinishNavigation();
  const pending = mounted ? readPending() : null;
  const flow = mounted ? currentFlow(signIn, signUp, pending?.flow) : null;
  const email = pending?.email ?? signUp.emailAddress ?? signIn.identifier ?? null;

  async function verify(code: string): Promise<AuthResult<AuthStep>> {
    const finish = finishTo(redirectTo);
    if (flow === "sign-up") {
      const { error } = await signUp.verifications.verifyEmailCode({ code });
      if (error) return fail(error);
      return continueSignUp(signUp, finish);
    }
    if (flow === "sign-in") {
      const { error } = await signIn.mfa.verifyEmailCode({ code });
      if (error) return fail(error);
      return continueSignIn(signIn, finish);
    }
    return failWith("code_wrong");
  }

  async function resend(): Promise<AuthResult> {
    if (flow === "sign-up") {
      const { error } = await signUp.verifications.sendEmailCode();
      return error ? fail(error) : done;
    }
    if (flow === "sign-in") {
      const { error } = await signIn.mfa.sendEmailCode();
      return error ? fail(error) : done;
    }
    return done;
  }

  return { ready: mounted, hasPending: flow !== null, email, verify, resend };
}

// ---------- Forgot and reset password ----------

// `token` is unused here: Clerk resets with an emailed code held in the current
// sign-in. A link-based adapter reads it from /reset-password?token=.
export function usePasswordReset(_: { token?: string }) {
  const { signIn } = useSignIn();
  const mounted = useMounted();
  const pending = mounted ? readPending() : null;

  async function requestReset(email: string): Promise<AuthResult> {
    rememberPending({ email, flow: "reset" });
    const { error } = await signIn.create({ identifier: email });
    const authError = error ? toAuthError(error) : null;
    // An unknown email looks exactly like a known one from here on.
    if (authError?.code === "wrong_credentials") return done;
    if (authError) return { ok: false, error: authError };
    const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
    return sendError ? fail(sendError) : done;
  }

  async function verifyCode(code: string): Promise<AuthResult> {
    if (!signIn.id) return failWith("code_wrong");
    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code });
    return error ? fail(error) : done;
  }

  async function setNewPassword({ password, signOutOtherDevices }: { password: string; signOutOtherDevices: boolean }): Promise<AuthResult> {
    const { error } = await signIn.resetPasswordEmailCode.submitPassword({ password, signOutOfOtherSessions: signOutOtherDevices });
    if (error) return fail(error);
    // Product rule: after a reset the person signs in again, so the new session is dropped.
    await signIn.reset();
    return done;
  }

  async function resend(): Promise<AuthResult> {
    if (!signIn.id) return done;
    const { error } = await signIn.resetPasswordEmailCode.sendCode();
    return error ? fail(error) : done;
  }

  return {
    ready: mounted,
    email: pending?.flow === "reset" ? pending.email : null,
    canSetPassword: mounted && signIn.status === "needs_new_password",
    requestReset,
    verifyCode,
    setNewPassword,
    resend,
  };
}

// ---------- Invite ----------

export function useInvite({ token, redirectTo }: Redirect & { token: string | null }) {
  const { signUp } = useSignUp();
  const finishTo = useFinishNavigation();
  const [state, setState] = useState<InviteState>(token ? { status: "loading" } : { status: "expired" });

  // Opening the ticket is what tells us the invite's email, or that it is spent.
  const openTicket = useEffectEvent(async (ticket: string, isCancelled: () => boolean) => {
    const { error } = await signUp.create({ strategy: "ticket", ticket });
    if (isCancelled()) return;
    const authError = error ? toAuthError(error) : null;
    if (authError?.code === "link_expired") setState({ status: "expired" });
    else if (authError || !signUp.emailAddress) setState({ status: "used" });
    else setState({ status: "ready", email: signUp.emailAddress });
  });

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    openTicket(token, () => cancelled);
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function accept({ name, password }: { name: string; password: string }): Promise<AuthResult<AuthStep>> {
    if (!token) return failWith("link_expired");
    const names = splitName(name);
    const { error } = await signUp.create({ strategy: "ticket", ticket: token, password, ...names });
    if (error) return fail(error);
    const finish = finishTo(redirectTo);
    return continueSignUp(signUp, finish);
  }

  return { state, accept };
}

// ---------- Sign out ----------

export function useSignOut() {
  const clerk = useClerk();
  return async function signOut(redirectTo = "/sign-in"): Promise<void> {
    forgetPending();
    await clerk.signOut({ redirectUrl: redirectTo });
  };
}
