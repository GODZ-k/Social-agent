"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail } from "lucide-react";
import { useEmailVerification } from "@/lib/auth/client";
import { withRedirect } from "@/lib/auth/redirect";
import { AUTH_POLICY } from "@/lib/auth/rules";
import { AuthHeading } from "./auth-heading";
import { CodeField } from "./code-field";
import { Notice } from "@/components/form/notice";
import { ResendRow } from "./resend-row";
import { StatusIcon } from "./status-icon";
import { SubmitButton } from "./submit-button";
import { TextLink } from "./text-link";
import { errorCopy } from "@/lib/auth/error-copy";
import { FlowEnded } from "./outcomes";
import { useAuthSubmit } from "@/hooks/use-auth-submit";
import { routes } from "@/config/routes";

const formSchema = z.object({
  code: z.string().length(AUTH_POLICY.codeLength, "Enter the 6-digit code"),
});
type VerifyValues = z.infer<typeof formSchema>;

/** AUTH-3: the 6-digit code after sign-up, or after a sign-in from a new device. */
export function VerifyEmailForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const { ready, hasPending, email, verify, resend } = useEmailVerification({ redirectTo });
  const { pending, error, setError, run } = useAuthSubmit();
  const form = useForm<VerifyValues>({ resolver: zodResolver(formSchema), defaultValues: { code: "" } });
  const [sentCount, setSentCount] = useState(0);
  const [navigatingAway, setNavigatingAway] = useState(false);
  const code = useWatch({ control: form.control, name: "code" });

  if (!ready) return <div className="skeleton h-80 w-full" role="status" aria-label="Loading" />;
  // `finalize` (inside `verify`) activates the session by calling Clerk's own `setActive`,
  // which pushes `signIn`/`signUp` state off "needs a code" through Clerk's own subscription —
  // re-rendering this still-mounted form mid-submit, before `verify()` even returns and before
  // its `router.push` to `redirectTo` finishes navigating away (finalize does not wait for that
  // navigation, so a slow-to-compile destination widens the gap). `pending` covers that whole
  // submit; `navigatingAway` covers the moment after it, once `pending` itself has cleared.
  // Without both, this reads as "this step has ended" on a step that in fact just succeeded.
  if (!hasPending && !pending && !navigatingAway) return <FlowEnded />;

  const expired = error?.code === "code_expired";
  const codeWrong = error?.code === "code_wrong";

  function onValid(values: VerifyValues) {
    run(
      () => verify(values.code),
      (step) => {
        if (step === "two-factor") router.push(withRedirect(routes.auth.twoFactor, redirectTo));
        else setNavigatingAway(true);
      },
    );
  }

  function sendAgain() {
    form.setValue("code", "");
    run(resend, () => setSentCount((count) => count + 1));
  }

  const lede = expired ? (
    <>
      We sent a code to <b>{email}</b>, but it is too old to use now.
    </>
  ) : (
    <>
      We sent a 6-digit code to <b>{email}</b>. It works for {AUTH_POLICY.codeMinutes} minutes.
    </>
  );

  return (
    <>
      <AuthHeading icon={<StatusIcon icon={Mail} />} title="Enter the code we emailed you">
        {lede}
      </AuthHeading>
      {expired ? <Notice tone="warning">{errorCopy("code_expired")}</Notice> : null}
      {sentCount > 0 && !error ? <Notice tone="success">New code sent to {email}. Codes from earlier emails no longer work.</Notice> : null}
      {error && !codeWrong && !expired ? <Notice tone="error">{errorCopy(error.code)}</Notice> : null}
      {expired ? (
        <div className="mt-6">
          <SubmitButton type="button" pending={pending} onClick={sendAgain}>
            Send a new code
          </SubmitButton>
        </div>
      ) : (
        <form className="mt-8 grid gap-4.5" onSubmit={form.handleSubmit(onValid)} noValidate aria-busy={pending}>
          <Controller
            control={form.control}
            name="code"
            render={({ field, fieldState }) => (
              <CodeField
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  if (codeWrong) setError(null);
                }}
                autoFocus
                disabled={pending}
                invalid={codeWrong || !!fieldState.error}
                message={codeWrong ? errorCopy("code_wrong") : (fieldState.error?.message ?? "You can paste the whole code.")}
              />
            )}
          />
          <SubmitButton pending={pending} disabled={code.length < AUTH_POLICY.codeLength}>
            Verify email
          </SubmitButton>
          <ResendRow hint="Didn't get it? Check spam." label="Send a new code" onResend={sendAgain} sentCount={sentCount} pending={pending} />
        </form>
      )}
      <p className="mt-6 text-sm text-muted-foreground">
        Wrong email? <TextLink href={routes.auth.signUp}>Change it</TextLink>
      </p>
    </>
  );
}
