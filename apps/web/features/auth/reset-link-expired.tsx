import Link from "next/link";
import { Link2Off } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { authCapabilities } from "@/lib/auth/client";
import { AUTH_POLICY } from "@/lib/auth/rules";
import { AuthHeading } from "@/components/auth/auth-heading";
import { StatusIcon } from "@/components/auth/status-icon";

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
          <Link href="/forgot-password">Send a new {WORD}</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="w-full">
          <Link href="/sign-in">Back to sign in</Link>
        </Button>
      </div>
    </>
  );
}
