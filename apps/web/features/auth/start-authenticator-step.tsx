"use client";

import { Smartphone } from "lucide-react";
import type { AuthError } from "@/lib/auth/types";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Notice } from "@/components/auth/notice";
import { StatusIcon } from "@/components/auth/status-icon";
import { SubmitButton } from "@/components/auth/submit-button";
import { errorCopy } from "./error-copy";
import { SetupProgress } from "./setup-progress";

/**
 * AUTH-7 step 1 when the provider offers only one second-factor method: there is
 * nothing to choose, so this explains what an authenticator app is instead of
 * faking a choice, and waits for a real click before `startAuthenticatorApp()`
 * runs (it can raise Clerk's reverification modal, so it can't start on mount).
 */
export function StartAuthenticatorStep({
  lede,
  pending,
  error,
  headingLevel,
  onStart,
  skip,
}: {
  lede: string;
  pending: boolean;
  error: AuthError | null;
  headingLevel?: 1 | 2;
  onStart: () => void;
  skip?: React.ReactNode;
}) {
  return (
    <>
      <SetupProgress step={1} />
      <AuthHeading icon={<StatusIcon icon={Smartphone} />} title="Turn on two-factor sign-in" level={headingLevel}>
        {lede}
      </AuthHeading>
      <p className="mt-6 text-sm leading-[1.45] text-muted-foreground">
        You&apos;ll confirm it&apos;s you with an authenticator app — Google Authenticator, 1Password, Authy or similar. It shows a new 6-digit code every 30
        seconds.
      </p>
      {error ? <Notice tone="error">{errorCopy(error.code)}</Notice> : null}
      <div className="mt-8 grid gap-4.5">
        <SubmitButton type="button" pending={pending} onClick={onStart}>
          Continue
        </SubmitButton>
        {skip}
      </div>
    </>
  );
}
