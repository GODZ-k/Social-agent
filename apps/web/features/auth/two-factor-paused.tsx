import Link from "next/link";
import { Timer } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { AUTH_POLICY } from "@/lib/auth/rules";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Notice } from "@/components/auth/notice";
import { PauseCountdown } from "@/components/auth/pause-countdown";
import { StatusIcon } from "@/components/auth/status-icon";
import { TextLink } from "@/components/auth/text-link";

/** Too many wrong second-step codes. The password was right, so it warns that someone may have it. */
export function TwoFactorPaused({ email, seconds = AUTH_POLICY.lockMinutes * 60 }: { email: string | null; seconds?: number }) {
  return (
    <>
      <AuthHeading icon={<StatusIcon icon={Timer} tone="danger" />} title={`Sign-in is paused for ${Math.ceil(seconds / 60)} minutes`}>
        The two-factor code{email ? <> for <b>{email}</b></> : null} was wrong too many times. We emailed you about it.
      </AuthHeading>
      <PauseCountdown seconds={seconds} />
      <Notice tone="error">
        Wasn&apos;t you? Someone has your password, because this step only comes after it. <TextLink href="/forgot-password">Reset your password</TextLink> now; it works
        while sign-in is paused.
      </Notice>
      <Button asChild size="lg" variant="outline" className="mt-6 w-full">
        <Link href="/sign-in">Back to sign in</Link>
      </Button>
    </>
  );
}
