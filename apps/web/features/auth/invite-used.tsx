import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { AuthHeading } from "@/components/auth/auth-heading";
import { StatusIcon } from "@/components/auth/status-icon";
import { TextLink } from "@/components/auth/text-link";

export function InviteUsed() {
  return (
    <>
      <AuthHeading icon={<StatusIcon icon={CircleCheck} />} title="This invite was already used">
        An account was set up with it. Sign in with the email the invite came to.
      </AuthHeading>
      <Button asChild size="lg" className="mt-6 w-full">
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <p className="mt-6 text-sm text-muted-foreground">
        Can&apos;t remember the password? <TextLink href="/forgot-password">Reset it</TextLink>
      </p>
    </>
  );
}
