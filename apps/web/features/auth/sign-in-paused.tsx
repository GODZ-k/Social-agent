import Link from "next/link";
import { Timer } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { AUTH_POLICY } from "@/lib/auth/rules";
import { AuthHeading } from "@/components/auth/auth-heading";
import { PauseCountdown } from "@/components/auth/pause-countdown";
import { StatusIcon } from "@/components/auth/status-icon";

/** AUTH-6: sign-in is paused after too many wrong passwords. Resetting still works. */
export function SignInPaused({ email, seconds = AUTH_POLICY.lockMinutes * 60, back }: { email: string; seconds?: number; back: React.ReactNode }) {
  return (
    <>
      <AuthHeading icon={<StatusIcon icon={Timer} tone="danger" />} title={`Sign-in is paused for ${Math.ceil(seconds / 60)} minutes`}>
        There were too many wrong passwords{email ? <> for <b>{email}</b></> : null}. This protects the account while we wait.
      </AuthHeading>
      <PauseCountdown seconds={seconds} />
      <div className="mt-6 grid gap-4.5">
        <p className="text-[0.8125rem] leading-normal text-muted-foreground">If you forgot your password, reset it now. Resetting works while sign-in is paused.</p>
        <Button asChild size="lg" className="w-full">
          <Link href="/forgot-password">Reset password</Link>
        </Button>
        {back}
      </div>
    </>
  );
}
