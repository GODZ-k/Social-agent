import type { Metadata } from "next";
import { ApprovalPanel } from "@/components/auth/approval-panel";
import { AuthFrame } from "@/components/auth/auth-frame";
import { SwitchLink } from "@/components/auth/switch-link";
import { ForgotPasswordFlow } from "@/components/auth/forgot-password-flow";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <AuthFrame top={<SwitchLink href="/sign-in" label="Back to sign in" />} panel={<ApprovalPanel />} promise="Nothing is published until you approve it.">
      <ForgotPasswordFlow />
    </AuthFrame>
  );
}
