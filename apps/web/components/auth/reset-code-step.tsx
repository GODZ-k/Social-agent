"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail } from "lucide-react";
import { AUTH_POLICY } from "@/lib/auth/rules";
import type { AuthResult } from "@/lib/auth/types";
import { AuthHeading } from "@/components/auth/auth-heading";
import { CodeField } from "@/components/auth/code-field";
import { Notice } from "@/components/auth/notice";
import { ResendRow } from "@/components/auth/resend-row";
import { StatusIcon } from "@/components/auth/status-icon";
import { SubmitButton } from "@/components/auth/submit-button";
import { textLinkClass } from "@/components/auth/text-link";
import { errorCopy } from "./error-copy";
import { useAuthSubmit } from "@/hooks/use-auth-submit";

const formSchema = z.object({
  code: z.string().length(AUTH_POLICY.codeLength, "Enter the 6-digit code"),
});
type ResetCodeValues = z.infer<typeof formSchema>;

/**
 * AUTH-4 "check email" for providers that email a reset code instead of a link.
 * Worded so it never confirms the account exists; an unknown email just never gets a working code.
 */
export function ResetCodeStep({
  email,
  verifyCode,
  resend,
  onChangeEmail,
}: {
  email: string;
  verifyCode: (code: string) => Promise<AuthResult>;
  resend: () => Promise<AuthResult>;
  onChangeEmail: () => void;
}) {
  const router = useRouter();
  const { pending, error, setError, run } = useAuthSubmit();
  const form = useForm<ResetCodeValues>({ resolver: zodResolver(formSchema), defaultValues: { code: "" } });
  const [sentCount, setSentCount] = useState(0);
  const code = useWatch({ control: form.control, name: "code" });

  function onValid(values: ResetCodeValues) {
    run(
      () => verifyCode(values.code),
      () => router.push("/reset-password"),
    );
  }

  const codeError = error?.code === "code_wrong" || error?.code === "code_expired" ? error : null;

  return (
    <>
      <AuthHeading icon={<StatusIcon icon={Mail} />} title="Check your email">
        If an account exists for <b>{email}</b>, we sent a 6-digit code to reset your password. It works for {AUTH_POLICY.codeMinutes} minutes.
      </AuthHeading>
      {error && !codeError ? <Notice tone="error">{errorCopy(error.code)}</Notice> : null}
      <form className="mt-8 grid gap-4.5" onSubmit={form.handleSubmit(onValid)} noValidate aria-busy={pending}>
        <Controller
          control={form.control}
          name="code"
          render={({ field, fieldState }) => (
            <CodeField
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                if (error) setError(null);
              }}
              autoFocus
              disabled={pending}
              invalid={!!codeError || !!fieldState.error}
              message={codeError ? errorCopy(codeError.code) : (fieldState.error?.message ?? "You can paste the whole code.")}
            />
          )}
        />
        <SubmitButton pending={pending} disabled={code.length < AUTH_POLICY.codeLength}>
          Continue
        </SubmitButton>
        <ResendRow
          hint="Nothing after a few minutes? Check spam."
          label="Send again"
          sentCount={sentCount}
          pending={pending}
          onResend={() => run(resend, () => setSentCount((count) => count + 1))}
        />
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        Typed the wrong email?{" "}
        <button type="button" className={textLinkClass} onClick={onChangeEmail}>
          Use a different one
        </button>
      </p>
    </>
  );
}
