"use client";

import { useState } from "react";
import { authCapabilities, usePasswordReset } from "@/lib/auth/client";
import { APP_NAME } from "@/lib/utils";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Notice } from "@/components/auth/notice";
import { SubmitButton } from "@/components/auth/submit-button";
import { TextField } from "@/components/auth/text-field";
import { TextLink } from "@/components/auth/text-link";
import { errorCopy } from "./error-copy";
import { ResetCodeStep } from "./reset-code-step";
import { ResetLinkSent } from "./reset-link-sent";
import { useAuthSubmit } from "./use-auth-submit";

// AUTH-4 was designed against a link-flow provider; Clerk sends a code instead, so the code
// path keeps the design's exact words where it can and adapts "link" to "code" where it can't.
const SEND_WORD = authCapabilities.passwordReset === "code" ? "code" : "link";

/** AUTH-4, first half: ask for the email, then say a message is on its way whether or not it has an account. */
export function ForgotPasswordFlow() {
  const reset = usePasswordReset({});
  const { pending, error, run } = useAuthSubmit();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    const changeEmail = () => setSent(false);
    return authCapabilities.passwordReset === "code" ? (
      <ResetCodeStep email={email} verifyCode={reset.verifyCode} resend={reset.resend} onChangeEmail={changeEmail} />
    ) : (
      <ResetLinkSent email={email} resend={reset.resend} onChangeEmail={changeEmail} />
    );
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    run(
      () => reset.requestReset(email.trim()),
      () => setSent(true),
    );
  }

  return (
    <>
      <AuthHeading title="Reset your password">
        Enter the email you use for {APP_NAME}. We&apos;ll send a {SEND_WORD} to choose a new password.
      </AuthHeading>
      {error ? <Notice tone="error">{errorCopy(error.code)}</Notice> : null}
      <form className="mt-8 grid gap-4.5" onSubmit={submit} aria-busy={pending}>
        <TextField
          id="email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          autoCapitalize="off"
          required
          autoFocus
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={pending}
        />
        <SubmitButton pending={pending}>Send reset {SEND_WORD}</SubmitButton>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        Remembered it? <TextLink href="/sign-in">Sign in</TextLink>
      </p>
    </>
  );
}
