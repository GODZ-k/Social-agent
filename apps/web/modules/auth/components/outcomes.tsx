import Link from "next/link";
import { CircleCheck, Clock, Link2Off, Timer } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { authCapabilities } from "@/lib/auth/client";
import { AUTH_POLICY } from "@/lib/auth/rules";
import { AuthHeading } from "./auth-heading";
import { Notice } from "@/components/form/notice";
import { PauseCountdown } from "./pause-countdown";
import { StatusIcon } from "./status-icon";
import { TextLink } from "./text-link";
import { routes } from "@/config/routes";

/**
 * The screens that end an auth flow: nothing to submit, only what happened and the way onward.
 * They share one file because they share their whole frame — heading, status icon, one or two
 * buttons — and a reader comparing their wording wants them side by side.
 */

/** Shown when a step is opened with nothing in progress, e.g. a bookmarked code page or another browser. */
export function FlowEnded() {
  return (
    <>
      <AuthHeading icon={<StatusIcon icon={Clock} tone="warning" />} title="This step has ended">
        It was started in another tab or browser, or it is too old to finish. Start again from sign in.
      </AuthHeading>
      <Button asChild size="lg" className="mt-6 w-full">
        <Link href={routes.auth.signIn}>Back to sign in</Link>
      </Button>
    </>
  );
}

// "Ask for a new invite" needs an endpoint that notifies the admin (DESIGN_TRACKER section 6);
// until it exists the screen says who to ask instead of offering a button that does nothing.
export function InviteExpired() {
  return (
    <>
      <AuthHeading icon={<StatusIcon icon={Link2Off} tone="warning" />} title="This invite has expired">
        Invites work for {AUTH_POLICY.inviteDays} days. Ask the person who invited you to send a new one. It comes to the same email.
      </AuthHeading>
      <p className="mt-6 text-sm text-muted-foreground">
        Already set up your account? <TextLink href={routes.auth.signIn}>Sign in</TextLink>
      </p>
    </>
  );
}

export function InviteUsed() {
  return (
    <>
      <AuthHeading icon={<StatusIcon icon={CircleCheck} />} title="This invite was already used">
        An account was set up with it. Sign in with the email the invite came to.
      </AuthHeading>
      <Button asChild size="lg" className="mt-6 w-full">
        <Link href={routes.auth.signIn}>Sign in</Link>
      </Button>
      <p className="mt-6 text-sm text-muted-foreground">
        Can&apos;t remember the password? <TextLink href={routes.auth.forgotPassword}>Reset it</TextLink>
      </p>
    </>
  );
}

/** After a reset the person signs in again with the new password (decided 2026-09-26). */
export function PasswordChanged({ email, signedOutOthers }: { email: string; signedOutOthers: boolean }) {
  return (
    <>
      <AuthHeading icon={<StatusIcon icon={CircleCheck} tone="success" />} title="Password changed">
        Sign in with your new password.{signedOutOthers ? " We signed you out on your other devices" : " We"} and sent a note to <b>{email}</b>.
      </AuthHeading>
      <Button asChild size="lg" className="mt-6 w-full">
        <Link href={routes.auth.signIn}>Sign in</Link>
      </Button>
      <p className="mt-6 text-sm text-muted-foreground">
        Didn&apos;t change it yourself? <TextLink href="#">Contact support</TextLink>
      </p>
    </>
  );
}

// AUTH-4 was designed against a link-flow provider; Clerk sends a code instead, so this
// keeps the design's exact words for a link and swaps in "code" for Clerk's real flow.
const IS_LINK = authCapabilities.passwordReset !== "code";
const WORD = IS_LINK ? "link" : "code";
const MINUTES = IS_LINK ? AUTH_POLICY.resetLinkMinutes : AUTH_POLICY.codeMinutes;

export function ResetLinkExpired() {
  return (
    <>
      <AuthHeading icon={<StatusIcon icon={Link2Off} tone="warning" />} title={`This ${WORD} no longer works`}>
        Reset {WORD}s work once, for {MINUTES} minutes. This one has expired or was already used. Send yourself a new one.
      </AuthHeading>
      <div className="mt-6 grid gap-3">
        <Button asChild size="lg" className="w-full">
          <Link href={routes.auth.forgotPassword}>Send a new {WORD}</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="w-full">
          <Link href={routes.auth.signIn}>Back to sign in</Link>
        </Button>
      </div>
    </>
  );
}

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
          <Link href={routes.auth.forgotPassword}>Reset password</Link>
        </Button>
        {back}
      </div>
    </>
  );
}

/** Too many wrong second-step codes. The password was right, so it warns that someone may have it. */
export function TwoFactorPaused({ email, seconds = AUTH_POLICY.lockMinutes * 60 }: { email: string | null; seconds?: number }) {
  return (
    <>
      <AuthHeading icon={<StatusIcon icon={Timer} tone="danger" />} title={`Sign-in is paused for ${Math.ceil(seconds / 60)} minutes`}>
        The two-factor code{email ? <> for <b>{email}</b></> : null} was wrong too many times. We emailed you about it.
      </AuthHeading>
      <PauseCountdown seconds={seconds} />
      <Notice tone="error">
        Wasn&apos;t you? Someone has your password, because this step only comes after it. <TextLink href={routes.auth.forgotPassword}>Reset your password</TextLink> now; it works
        while sign-in is paused.
      </Notice>
      <Button asChild size="lg" variant="outline" className="mt-6 w-full">
        <Link href={routes.auth.signIn}>Back to sign in</Link>
      </Button>
    </>
  );
}

export function RecoverySent() {
  return (
    <>
      <AuthHeading icon={<StatusIcon icon={CircleCheck} tone="success" />} title="Recovery request sent">
        We&apos;ll email you within 1 working day to book a short video call. Keep your ID handy.
      </AuthHeading>
      <Notice tone="info">Your account stays locked until then. Posts that were already approved still go out on schedule.</Notice>
      <Button asChild size="lg" variant="outline" className="mt-6 w-full">
        <Link href={routes.auth.signIn}>Back to sign in</Link>
      </Button>
    </>
  );
}
