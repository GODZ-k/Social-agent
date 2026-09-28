"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { AUTH_POLICY } from "@/lib/auth/rules";
import type { AuthResult } from "@/lib/auth/types";
import { AuthHeading } from "@/components/auth/auth-heading";
import { ResendRow } from "@/components/auth/resend-row";
import { StatusIcon } from "@/components/auth/status-icon";
import { textLinkClass } from "@/components/auth/text-link";
import { useAuthSubmit } from "./use-auth-submit";

/** AUTH-4 "check email" for providers that email a reset link. Worded so it never confirms the account exists. */
export function ResetLinkSent({ email, resend, onChangeEmail }: { email: string; resend: () => Promise<AuthResult>; onChangeEmail: () => void }) {
  const { pending, run } = useAuthSubmit();
  const [sentCount, setSentCount] = useState(0);
  return (
    <>
      <AuthHeading icon={<StatusIcon icon={Mail} />} title="Check your email">
        If an account exists for <b>{email}</b>, we sent a link to reset your password. The link works for {AUTH_POLICY.resetLinkMinutes} minutes.
      </AuthHeading>
      <div className="mt-6 grid gap-4.5">
        <Button asChild size="lg" variant="outline" className="w-full">
          <Link href="/sign-in">
            <ArrowLeft />
            Back to sign in
          </Link>
        </Button>
        <ResendRow hint="Nothing after a few minutes? Check spam." label="Send again" sentCount={sentCount} pending={pending} onResend={() => run(resend, () => setSentCount((count) => count + 1))} />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Typed the wrong email?{" "}
        <button type="button" className={textLinkClass} onClick={onChangeEmail}>
          Use a different one
        </button>
      </p>
    </>
  );
}
