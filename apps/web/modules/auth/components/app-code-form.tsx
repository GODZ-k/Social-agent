"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShieldCheck } from "lucide-react";
import { AUTH_POLICY } from "@/lib/auth/rules";
import type { AuthError, AuthResult, AuthStep } from "@/lib/auth/types";
import { APP_NAME } from "@/lib/utils";
import { AuthHeading } from "./auth-heading";
import { CodeField } from "./code-field";
import { Notice } from "@/components/form/notice";
import { StatusIcon } from "./status-icon";
import { SubmitButton } from "./submit-button";
import { errorCopy } from "@/lib/auth/error-copy";
import { useAuthSubmit, whenLocked } from "@/hooks/use-auth-submit";

const WRONG = "That code isn't right. Enter the code showing now; it changes every 30 seconds.";

const schema = z.object({ code: z.string().length(AUTH_POLICY.codeLength, "Enter the 6-digit code.") });
type Values = z.infer<typeof schema>;

/** The authenticator-app code at sign-in. */
export function AppCodeForm({
  lede,
  verify,
  onPaused,
}: {
  lede: React.ReactNode;
  verify: (code: string) => Promise<AuthResult<AuthStep>>;
  onPaused: (error: AuthError) => void;
}) {
  const { pending, error, setError, run } = useAuthSubmit();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { code: "" } });
  const code = useWatch({ control: form.control, name: "code" });

  function submit(values: Values) {
    run(() => verify(values.code), undefined, whenLocked(onPaused));
  }

  const wrong = error?.code === "code_wrong";

  return (
    <>
      <AuthHeading icon={<StatusIcon icon={ShieldCheck} />} title="Enter your two-factor code">
        {lede}Your password was accepted; this is the second step.
      </AuthHeading>
      {error && !wrong ? <Notice tone="error">{errorCopy(error.code)}</Notice> : null}
      <form className="mt-8 grid gap-4.5" onSubmit={form.handleSubmit(submit)} aria-busy={pending}>
        <Controller
          control={form.control}
          name="code"
          render={({ field }) => (
            <CodeField
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                if (error) setError(null);
              }}
              autoFocus
              disabled={pending}
              invalid={wrong}
              message={wrong ? WRONG : `Open your authenticator app and find ${APP_NAME}.`}
            />
          )}
        />
        <SubmitButton pending={pending} disabled={code.length < AUTH_POLICY.codeLength}>
          Verify and sign in
        </SubmitButton>
      </form>
    </>
  );
}
