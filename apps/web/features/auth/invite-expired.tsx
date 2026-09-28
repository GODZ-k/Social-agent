import { Link2Off } from "lucide-react";
import { AUTH_POLICY } from "@/lib/auth/rules";
import { AuthHeading } from "@/components/auth/auth-heading";
import { StatusIcon } from "@/components/auth/status-icon";
import { TextLink } from "@/components/auth/text-link";

// "Ask for a new invite" needs an endpoint that notifies the admin (DESIGN_TRACKER section 6);
// until it exists the screen says who to ask instead of offering a button that does nothing.
export function InviteExpired() {
  return (
    <>
      <AuthHeading icon={<StatusIcon icon={Link2Off} tone="warning" />} title="This invite has expired">
        Invites work for {AUTH_POLICY.inviteDays} days. Ask the person who invited you to send a new one. It comes to the same email.
      </AuthHeading>
      <p className="mt-6 text-sm text-muted-foreground">
        Already set up your account? <TextLink href="/sign-in">Sign in</TextLink>
      </p>
    </>
  );
}
