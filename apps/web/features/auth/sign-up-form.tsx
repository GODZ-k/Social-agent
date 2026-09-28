"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authCapabilities, BotCheck, useSignUpFlow } from "@/lib/auth/client";
import { withRedirect } from "@/lib/auth/redirect";
import { checkPassword, passwordAllowed } from "@/lib/auth/rules";
import { APP_NAME } from "@/lib/utils";
import { AuthHeading } from "@/components/auth/auth-heading";
import { GoogleButton } from "@/components/auth/google-button";
import { Notice } from "@/components/auth/notice";
import { PasswordField } from "@/components/auth/password-field";
import { PasswordRulesList } from "@/components/auth/password-rules-list";
import { SubmitButton } from "@/components/auth/submit-button";
import { TextField } from "@/components/auth/text-field";
import { TextLink } from "@/components/auth/text-link";
import { errorCopy } from "./error-copy";
import { useAuthSubmit } from "./use-auth-submit";

const PASSWORD_ERRORS = new Set(["password_too_short", "password_leaked"]);

/**
 * AUTH-2. Always continues to the code step, even for an email that already has
 * an account, so the page never tells anyone which emails are registered.
 */
export function SignUpForm({ redirectTo, site }: { redirectTo: string; site?: React.ReactNode }) {
  const router = useRouter();
  const { signUpWithPassword, signUpWithGoogle } = useSignUpFlow({ redirectTo });
  const { pending, error, setError, run } = useAuthSubmit();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const passwordError = error && PASSWORD_ERRORS.has(error.code) ? error : null;
  const leaked = passwordError?.code === "password_leaked" ? true : undefined;
  const rules = checkPassword(password, email, leaked);
  const emailTaken = error?.code === "email_in_use";

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!passwordAllowed(rules)) return;
    const name = String(new FormData(event.currentTarget).get("name") ?? "");
    run(
      () => signUpWithPassword({ name, email: email.trim(), password }),
      () => router.push(withRedirect("/verify", redirectTo)),
    );
  }

  function changePassword(value: string) {
    setPassword(value);
    if (passwordError) setError(null);
  }

  const passwordRules = <PasswordRulesList rules={rules} />;

  return (
    <>
      <AuthHeading title="Create your account">Next you paste your website, and {APP_NAME} drafts a brand kit you can edit.</AuthHeading>
      {site}
      {error && !passwordError && !emailTaken ? <Notice tone="error">{errorCopy(error.code)}</Notice> : null}
      <form className="mt-8 grid gap-4.5" onSubmit={submit} aria-busy={pending}>
        {authCapabilities.google ? <GoogleButton label="Sign up with Google" onClick={() => run(signUpWithGoogle)} disabled={pending} /> : null}
        <TextField id="name" label="Your name" autoComplete="name" required disabled={pending} />
        <TextField
          id="email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          autoCapitalize="off"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={pending}
          aria-invalid={emailTaken || undefined}
          message={
            emailTaken ? (
              <>
                This email already has an account. <TextLink href={withRedirect("/sign-in", redirectTo)}>Sign in</TextLink> or{" "}
                <TextLink href={withRedirect("/forgot-password", redirectTo)}>reset your password</TextLink>.
              </>
            ) : undefined
          }
        />
        <PasswordField
          id="password"
          label="Password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => changePassword(event.target.value)}
          disabled={pending}
          aria-invalid={passwordError ? true : undefined}
          message={passwordError ? errorCopy(passwordError.code) : undefined}
          after={passwordRules}
        />
        {/* Empty until Clerk needs a challenge; without this it still claims a full gap on both sides and doubles the space before the button. */}
        <div className="-my-2.25">
          <BotCheck />
        </div>
        <SubmitButton pending={pending} pendingLabel="Creating your account">
          Create account
        </SubmitButton>
        <p className="text-[0.8125rem] leading-normal text-muted-foreground">
          By creating an account you agree to the <TextLink href="#">Terms</TextLink> and <TextLink href="#">Privacy policy</TextLink>.
        </p>
      </form>
    </>
  );
}
