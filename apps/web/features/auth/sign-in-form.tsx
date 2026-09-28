"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { authCapabilities, useSignInFlow } from "@/lib/auth/client";
import { withRedirect } from "@/lib/auth/redirect";
import type { AuthStep } from "@/lib/auth/types";
import { APP_NAME } from "@/lib/utils";
import { AuthHeading } from "@/components/auth/auth-heading";
import { GoogleButton } from "@/components/auth/google-button";
import { Notice } from "@/components/auth/notice";
import { PasswordField } from "@/components/auth/password-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { TextField } from "@/components/auth/text-field";
import { TextLink } from "@/components/auth/text-link";
import { errorCopy } from "./error-copy";
import { SignInPaused } from "./sign-in-paused";
import { useAuthSubmit } from "./use-auth-submit";

const NEXT_SCREEN: Record<Exclude<AuthStep, "done">, string> = {
  "verify-email": "/verify",
  "two-factor": "/two-factor",
  "set-up-two-factor": "/two-factor/setup",
};

/** AUTH-1 and AUTH-6: email and password, and the pause after too many wrong tries. Never says which field was wrong. */
export function SignInForm({ redirectTo, sessionEnded }: { redirectTo: string; sessionEnded: boolean }) {
  const router = useRouter();
  const { signInWithPassword, signInWithGoogle } = useSignInFlow({ redirectTo });
  const { pending, error, setError, run } = useAuthSubmit();
  const [email, setEmail] = useState("");

  if (error?.code === "too_many_attempts") {
    const back = (
      <Button type="button" size="lg" variant="outline" className="w-full" onClick={() => setError(null)}>
        Back to sign in
      </Button>
    );
    return <SignInPaused email={email} seconds={error.retryAfterSeconds} back={back} />;
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    run(
      () => signInWithPassword({ email: email.trim(), password }),
      (step) => {
        if (step !== "done") router.push(withRedirect(NEXT_SCREEN[step], redirectTo));
      },
    );
  }

  const wrong = error?.code === "wrong_credentials";
  const resetHref = withRedirect("/forgot-password", redirectTo);

  return (
    <>
      <AuthHeading title={`Sign in to ${APP_NAME}`}>Use the email you signed up with, or the one your invite came to.</AuthHeading>
      {sessionEnded && !error ? <Notice tone="info">You were signed out because your session ended. Sign in to carry on where you were.</Notice> : null}
      {wrong ? (
        <Notice tone="error">
          That email and password don&apos;t match. Check both, or <TextLink href={resetHref}>reset your password</TextLink>.
        </Notice>
      ) : null}
      {error && !wrong ? <Notice tone="error">{errorCopy(error.code)}</Notice> : null}
      <form className="mt-8 grid gap-4.5" onSubmit={submit} aria-busy={pending}>
        {authCapabilities.google && !pending ? <GoogleButton label="Continue with Google" onClick={() => run(signInWithGoogle)} /> : null}
        <TextField
          id="email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          autoCapitalize="off"
          placeholder="you@business.com"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={pending}
        />
        <PasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          required
          disabled={pending}
          aria-invalid={wrong || undefined}
          labelAside={<TextLink href={resetHref}>Forgot password?</TextLink>}
        />
        <SubmitButton pending={pending} pendingLabel="Signing in">
          Sign in
        </SubmitButton>
      </form>
    </>
  );
}
