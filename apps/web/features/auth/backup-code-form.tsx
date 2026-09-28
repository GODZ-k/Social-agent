"use client";

import { useState } from "react";
import { List } from "lucide-react";
import type { AuthError, AuthResult, AuthStep } from "@/lib/auth/types";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Notice } from "@/components/auth/notice";
import { StatusIcon } from "@/components/auth/status-icon";
import { SubmitButton } from "@/components/auth/submit-button";
import { TextField } from "@/components/auth/text-field";
import { errorCopy } from "./error-copy";
import { useAuthSubmit } from "./use-auth-submit";

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
  const [code, setCode] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    run(
      () => verify(code.trim()),
      undefined,
      (failure) => {
        if (failure.code === "too_many_attempts") onPaused(failure);
      },
    );
  }

  function changeCode(value: string) {
    setCode(value);
    if (error) setError(null);
  }

  const wrong = error?.code === "code_wrong";

  return (
    <>
      <AuthHeading icon={<StatusIcon icon={List} />} title="Use a backup code">
        {lede}Enter one of the codes you saved when you turned on two-factor.
      </AuthHeading>
      {error && !wrong ? <Notice tone="error">{errorCopy(error.code)}</Notice> : null}
      <form className="mt-8 grid gap-4.5" onSubmit={submit} aria-busy={pending}>
        <TextField
          id="backup"
          label="Backup code"
          autoComplete="one-time-code"
          spellCheck={false}
          autoCapitalize="off"
          autoFocus
          required
          placeholder="xxxx-xxxx"
          maxLength={9}
          className="font-mono tracking-[0.08em]"
          value={code}
          onChange={(event) => changeCode(event.target.value)}
          disabled={pending}
          aria-invalid={wrong || undefined}
          message={
            wrong ? "That backup code isn't right, or it was already used. Each code works once." : "8 letters and numbers. The dash is optional. Each code works once."
          }
        />
        <SubmitButton pending={pending}>Verify and sign in</SubmitButton>
      </form>
    </>
  );
}
