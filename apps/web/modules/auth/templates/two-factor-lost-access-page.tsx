import { AuthFrame } from "@/modules/auth/components/auth-frame";
import { TwoFactorPanel } from "@/modules/auth/components/two-factor-panel";
import { LostAccess } from "@/modules/auth/components/lost-access";

export function TwoFactorLostAccessPage() {
  const panel = <TwoFactorPanel heading="A stolen password alone can't get in." body="So getting back in without your phone takes a real check, never just an email." />;
  return (
    <AuthFrame panel={panel} promise="Two-factor keeps your account safe.">
      <LostAccess />
    </AuthFrame>
  );
}
