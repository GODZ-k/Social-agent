import type { Metadata } from "next";
import { TwoFactorLostAccessPage } from "@/modules/auth/templates/two-factor-lost-access-page";

export const metadata: Metadata = { title: "Get back into your account" };

export default function Page() {
  return <TwoFactorLostAccessPage />;
}
