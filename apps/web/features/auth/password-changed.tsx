import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { AuthHeading } from "@/components/auth/auth-heading";
import { StatusIcon } from "@/components/auth/status-icon";
import { TextLink } from "@/components/auth/text-link";

/** After a reset the person signs in again with the new password (decided 2026-09-26). */
export function PasswordChanged({ email, signedOutOthers }: { email: string; signedOutOthers: boolean }) {
  return (
    <>
      <AuthHeading icon={<StatusIcon icon={CircleCheck} tone="success" />} title="Password changed">
        Sign in with your new password.{signedOutOthers ? " We signed you out on your other devices" : " We"} and sent a note to <b>{email}</b>.
      </AuthHeading>
      <Button asChild size="lg" className="mt-6 w-full">
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <p className="mt-6 text-sm text-muted-foreground">
        Didn&apos;t change it yourself? <TextLink href="#">Contact support</TextLink>
      </p>
    </>
  );
}
