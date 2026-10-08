import type { Metadata } from "next";
import { ResetPasswordPage } from "@/modules/auth/templates/reset-password-page";

export const metadata: Metadata = { title: "Choose a new password" };

export default function Page(props: PageProps<"/reset-password">) {
  return <ResetPasswordPage searchParams={props.searchParams} />;
}
