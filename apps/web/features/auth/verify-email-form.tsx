"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { useEmailVerification } from "@/lib/auth/client";
import { withRedirect } from "@/lib/auth/redirect";
import { AUTH_POLICY } from "@/lib/auth/rules";
import { AuthHeading } from "@/components/auth/auth-heading";
import { CodeField } from "@/components/auth/code-field";
import { Notice } from "@/components/auth/notice";
import { ResendRow } from "@/components/auth/resend-row";
import { StatusIcon } from "@/components/auth/status-icon";
import { SubmitButton } from "@/components/auth/submit-button";
import { TextLink } from "@/components/auth/text-link";
import { errorCopy } from "./error-copy";
import { FlowEnded } from "./flow-ended";
import { useAuthSubmit } from "./use-auth-submit";

/** AUTH-3: the 6-digit code after sign-up, or after a sign-in from a new device. */
export function VerifyEmailForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const { ready, hasPending, email, verify, resend } = useEmailVerification({ redirectTo });
  const { pending, error, setError, run } = useAuthSubmit();
  const [code, setCode] = useState("");
  const [sentCount, setSentCount] = useState(0);

  if (!ready) return <div className="skeleton h-80 w-full" role="status" aria-label="Loading" />;
  if (!hasPending) return <FlowEnded />;

  const expired = error?.code === "code_expired";

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    run(
      () => verify(code),
      (step) => {
        if (step === "two-factor") router.push(withRedirect("/two-factor", redirectTo));
      },
    );
  }

  function sendAgain() {
    setCode("");
    run(resend, () => setSentCount((count) => count + 1));
  }

  function changeCode(value: string) {
    setCode(value);
    if (error?.code === "code_wrong") setError(null);
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
      {error && error.code !== "code_wrong" && !expired ? <Notice tone="error">{errorCopy(error.code)}</Notice> : null}
      {expired ? (
        <div className="mt-6">
          <SubmitButton type="button" pending={pending} onClick={sendAgain}>
            Send a new code
          </SubmitButton>
        </div>
      ) : (
        <form className="mt-8 grid gap-4.5" onSubmit={submit} aria-busy={pending}>
          <CodeField
            value={code}
            onValueChange={changeCode}
            autoFocus
            disabled={pending}
            invalid={error?.code === "code_wrong"}
            message={error?.code === "code_wrong" ? errorCopy("code_wrong") : "You can paste the whole code."}
          />
          <SubmitButton pending={pending} disabled={code.length < AUTH_POLICY.codeLength}>
            Verify email
          </SubmitButton>
          <ResendRow hint="Didn't get it? Check spam." label="Send a new code" onResend={sendAgain} sentCount={sentCount} pending={pending} />
        </form>
      )}
      <p className="mt-6 text-sm text-muted-foreground">
        Wrong email? <TextLink href="/sign-up">Change it</TextLink>
      </p>
    </>
  );
}
