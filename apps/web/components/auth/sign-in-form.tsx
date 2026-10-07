"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { SignInPaused } from "./outcomes";
import { useAuthSubmit } from "@/hooks/use-auth-submit";

const NEXT_SCREEN: Record<Exclude<AuthStep, "done">, string> = {
  "verify-email": "/verify",
  "two-factor": "/two-factor",
  "set-up-two-factor": "/two-factor/setup",
};

const formSchema = z.object({
  email: z.string().trim().min(1, "Enter your email").pipe(z.email("Enter a valid email")),
  password: z.string().min(1, "Enter your password"),
});
type SignInValues = z.infer<typeof formSchema>;

/** AUTH-1 and AUTH-6: email and password, and the pause after too many wrong tries. Never says which field was wrong. */
export function SignInForm({ redirectTo, sessionEnded }: { redirectTo: string; sessionEnded: boolean }) {
  const router = useRouter();
  const { signInWithPassword, signInWithGoogle } = useSignInFlow({ redirectTo });
  const { pending, error, setError, run } = useAuthSubmit();
  const form = useForm<SignInValues>({ resolver: zodResolver(formSchema), defaultValues: { email: "", password: "" } });
  const email = useWatch({ control: form.control, name: "email" });

  if (error?.code === "too_many_attempts") {
    const back = (
      <Button type="button" size="lg" variant="outline" className="w-full" onClick={() => setError(null)}>
        Back to sign in
      </Button>
    );
    return <SignInPaused email={email} seconds={error.retryAfterSeconds} back={back} />;
  }

  function onValid(values: SignInValues) {
    run(
      () => signInWithPassword(values),
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
      <form className="mt-8 grid gap-4.5" onSubmit={form.handleSubmit(onValid)} noValidate aria-busy={pending}>
        {authCapabilities.google && !pending ? <GoogleButton label="Continue with Google" onClick={() => run(signInWithGoogle)} /> : null}
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField
              id="email"
              label="Email"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              autoCapitalize="off"
              placeholder="you@business.com"
              {...field}
              disabled={pending}
              aria-invalid={!!fieldState.error || undefined}
              message={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <PasswordField
              id="password"
              label="Password"
              autoComplete="current-password"
              {...field}
              disabled={pending}
              aria-invalid={wrong || !!fieldState.error || undefined}
              message={fieldState.error?.message}
              labelAside={<TextLink href={resetHref}>Forgot password?</TextLink>}
            />
          )}
        />
        <SubmitButton pending={pending} pendingLabel="Signing in">
          Sign in
        </SubmitButton>
      </form>
    </>
  );
}
