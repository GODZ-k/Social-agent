import type { Metadata } from "next";
import { TwoFactorSetupPage } from "@/modules/auth/templates/two-factor-setup-page";

export const metadata: Metadata = { title: "Turn on two-factor" };

export default function Page(props: PageProps<"/two-factor/setup">) {
  return <TwoFactorSetupPage searchParams={props.searchParams} />;
}
