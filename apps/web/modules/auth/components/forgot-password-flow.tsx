"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authCapabilities, usePasswordReset } from "@/lib/auth/client";
import { APP_NAME } from "@/lib/utils";
import { AuthHeading } from "./auth-heading";
import { Notice } from "@/components/form/notice";
import { SubmitButton } from "./submit-button";
import { TextField } from "./text-field";
import { TextLink } from "./text-link";
import { errorCopy } from "@/lib/auth/error-copy";
import { ResetCodeStep } from "./reset-code-step";
import { ResetLinkSent } from "./reset-link-sent";
import { useAuthSubmit } from "@/hooks/use-auth-submit";
import { routes } from "@/config/routes";

// AUTH-4 was designed against a link-flow provider; Clerk sends a code instead, so the code
// path keeps the design's exact words where it can and adapts "link" to "code" where it can't.
const SEND_WORD = authCapabilities.passwordReset === "code" ? "code" : "link";

const formSchema = z.object({
  email: z.string().trim().min(1, "Enter your email").pipe(z.email("Enter a valid email")),
});
type ForgotPasswordValues = z.infer<typeof formSchema>;

/** AUTH-4, first half: ask for the email, then say a message is on its way whether or not it has an account. */
export function ForgotPasswordFlow() {
  const reset = usePasswordReset({});
  const { pending, error, run } = useAuthSubmit();
  const form = useForm<ForgotPasswordValues>({ resolver: zodResolver(formSchema), defaultValues: { email: "" } });
  const [sent, setSent] = useState(false);
  const email = useWatch({ control: form.control, name: "email" });

  if (sent) {
    const changeEmail = () => setSent(false);
    return authCapabilities.passwordReset === "code" ? (
      <ResetCodeStep email={email} verifyCode={reset.verifyCode} resend={reset.resend} onChangeEmail={changeEmail} />
    ) : (
      <ResetLinkSent email={email} resend={reset.resend} onChangeEmail={changeEmail} />
    );
  }

  function onValid(values: ForgotPasswordValues) {
    run(
      () => reset.requestReset(values.email),
      () => setSent(true),
    );
  }

  return (
    <>
      <AuthHeading title="Reset your password">
        Enter the email you use for {APP_NAME}. We&apos;ll send a {SEND_WORD} to choose a new password.
      </AuthHeading>
      {error ? <Notice tone="error">{errorCopy(error.code)}</Notice> : null}
      <form className="mt-8 grid gap-4.5" onSubmit={form.handleSubmit(onValid)} noValidate aria-busy={pending}>
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
              autoFocus
              {...field}
              disabled={pending}
              aria-invalid={!!fieldState.error || undefined}
              message={fieldState.error?.message}
            />
          )}
        />
        <SubmitButton pending={pending}>Send reset {SEND_WORD}</SubmitButton>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        Remembered it? <TextLink href={routes.auth.signIn}>Sign in</TextLink>
      </p>
    </>
  );
}
