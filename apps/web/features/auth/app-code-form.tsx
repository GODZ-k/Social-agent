"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { AUTH_POLICY } from "@/lib/auth/rules";
import type { AuthError, AuthResult, AuthStep } from "@/lib/auth/types";
import { APP_NAME } from "@/lib/utils";
import { AuthHeading } from "@/components/auth/auth-heading";
import { CodeField } from "@/components/auth/code-field";
import { Notice } from "@/components/auth/notice";
import { StatusIcon } from "@/components/auth/status-icon";
import { SubmitButton } from "@/components/auth/submit-button";
import { errorCopy } from "./error-copy";
import { useAuthSubmit } from "./use-auth-submit";

const WRONG = "That code isn't right. Enter the code showing now; it changes every 30 seconds.";

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
  const [code, setCode] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    run(
      () => verify(code),
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
      <AuthHeading icon={<StatusIcon icon={ShieldCheck} />} title="Enter your two-factor code">
        {lede}Your password was accepted; this is the second step.
      </AuthHeading>
      {error && !wrong ? <Notice tone="error">{errorCopy(error.code)}</Notice> : null}
      <form className="mt-8 grid gap-4.5" onSubmit={submit} aria-busy={pending}>
        <CodeField
          value={code}
          onValueChange={changeCode}
          autoFocus
          disabled={pending}
          invalid={wrong}
          message={wrong ? WRONG : `Open your authenticator app and find ${APP_NAME}.`}
        />
        <SubmitButton pending={pending} disabled={code.length < AUTH_POLICY.codeLength}>
          Verify and sign in
        </SubmitButton>
      </form>
    </>
  );
}
