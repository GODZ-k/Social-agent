import type { Metadata } from "next";
import { ForgotPasswordPage } from "@/modules/auth/templates/forgot-password-page";

export const metadata: Metadata = { title: "Reset your password" };

export default function Page() {
  return <ForgotPasswordPage />;
}
