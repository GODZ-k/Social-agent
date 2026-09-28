"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { List } from "lucide-react";
import type { AuthError, AuthResult, AuthStep } from "@/lib/auth/types";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Notice } from "@/components/auth/notice";
import { StatusIcon } from "@/components/auth/status-icon";
import { SubmitButton } from "@/components/auth/submit-button";
import { TextField } from "@/components/auth/text-field";
import { errorCopy } from "./error-copy";
import { useAuthSubmit } from "./use-auth-submit";

const schema = z.object({ backup: z.string().trim().min(1, "Enter a backup code.") });
type Values = z.infer<typeof schema>;

/** One of the saved backup codes, when the phone is not to hand. */
export function BackupCodeForm({
  lede,
  verify,
  onPaused,
}: {
  lede: React.ReactNode;
  verify: (code: string) => Promise<AuthResult<AuthStep>>;
  onPaused: (error: AuthError) => void;
}) {
  const { pending, error, setError, run } = useAuthSubmit();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { backup: "" } });

  function submit(values: Values) {
    run(
      () => verify(values.backup),
      undefined,
      (failure) => {
        if (failure.code === "too_many_attempts") onPaused(failure);
      },
    );
  }

  const wrong = error?.code === "code_wrong";

  return (
    <>
      <AuthHeading icon={<StatusIcon icon={List} />} title="Use a backup code">
        {lede}Enter one of the codes you saved when you turned on two-factor.
      </AuthHeading>
      {error && !wrong ? <Notice tone="error">{errorCopy(error.code)}</Notice> : null}
      <form className="mt-8 grid gap-4.5" onSubmit={form.handleSubmit(submit)} aria-busy={pending}>
        <Controller
          control={form.control}
          name="backup"
          render={({ field, fieldState }) => (
            <TextField
              id="backup"
              label="Backup code"
              autoComplete="one-time-code"
              spellCheck={false}
              autoCapitalize="off"
              autoFocus
              placeholder="xxxx-xxxx"
              maxLength={9}
              className="font-mono tracking-[0.08em]"
              {...field}
              onChange={(event) => {
                field.onChange(event);
                if (error) setError(null);
              }}
              disabled={pending}
              aria-invalid={wrong || !!fieldState.error || undefined}
              message={
                wrong
                  ? "That backup code isn't right, or it was already used. Each code works once."
                  : (fieldState.error?.message ?? "8 letters and numbers. The dash is optional. Each code works once.")
              }
            />
          )}
        />
        <SubmitButton pending={pending}>Verify and sign in</SubmitButton>
      </form>
    </>
  );
}
