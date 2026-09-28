"use client";

import { useState } from "react";
import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { requestAccountRecovery } from "@/lib/auth/actions";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Notice } from "@/components/auth/notice";
import { StatusIcon } from "@/components/auth/status-icon";
import { SubmitButton } from "@/components/auth/submit-button";
import { TextLink } from "@/components/auth/text-link";
import { errorCopy } from "./error-copy";
import { RecoverySent } from "./recovery-sent";
import { RecoverySteps } from "./recovery-steps";
import { useAuthSubmit } from "./use-auth-submit";

/** AUTH-7 lost access: support checks who you are on a video call. There is no email-only way back in. */
export function LostAccess() {
  const { pending, error, run } = useAuthSubmit();
  const [sent, setSent] = useState(false);

  if (sent) return <RecoverySent />;

  return (
    <>
      <AuthHeading icon={<StatusIcon icon={LifeBuoy} />} title="Get back into your account">
        With no phone or backup codes, we check it&apos;s really you before we turn off two-factor. There&apos;s no email-only shortcut, because an email
        account can be taken over too.
      </AuthHeading>
      <RecoverySteps />
      {error ? <Notice tone="error">{errorCopy(error.code)}</Notice> : null}
      <div className="mt-6 grid gap-3">
        <SubmitButton type="button" pending={pending} onClick={() => run(requestAccountRecovery, () => setSent(true))}>
          Send recovery request
        </SubmitButton>
        <Button asChild size="lg" variant="outline" className="w-full">
          <Link href="/sign-in">Back to sign in</Link>
        </Button>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Found a backup code? <TextLink href="/two-factor">Use it instead</TextLink>. It&apos;s much faster.
      </p>
    </>
  );
}
