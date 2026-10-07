import type { Metadata } from "next";
import { AuthFrame } from "@/components/auth/auth-frame";
import { TwoFactorPanel } from "@/components/auth/two-factor-panel";
import { LostAccess } from "@/components/auth/lost-access";

export const metadata: Metadata = { title: "Get back into your account" };

export default function LostAccessPage() {
  const panel = <TwoFactorPanel heading="A stolen password alone can't get in." body="So getting back in without your phone takes a real check, never just an email." />;
  return (
    <AuthFrame panel={panel} promise="Two-factor keeps your account safe.">
      <LostAccess />
    </AuthFrame>
  );
}
