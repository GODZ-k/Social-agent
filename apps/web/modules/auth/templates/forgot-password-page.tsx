import { routes } from "@/config/routes";
import { ApprovalPanel } from "@/modules/auth/components/approval-panel";
import { AuthFrame } from "@/modules/auth/components/auth-frame";
import { SwitchLink } from "@/modules/auth/components/switch-link";
import { ForgotPasswordFlow } from "@/modules/auth/components/forgot-password-flow";

export function ForgotPasswordPage() {
  return (
    <AuthFrame top={<SwitchLink href={routes.auth.signIn} label="Back to sign in" />} panel={<ApprovalPanel />} promise="Nothing is published until you approve it.">
      <ForgotPasswordFlow />
    </AuthFrame>
  );
}
