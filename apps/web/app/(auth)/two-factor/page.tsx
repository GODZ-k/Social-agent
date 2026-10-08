import type { Metadata } from "next";
import { TwoFactorPage } from "@/modules/auth/templates/two-factor-page";

export const metadata: Metadata = { title: "Two-factor code" };

export default function Page(props: PageProps<"/two-factor">) {
  return <TwoFactorPage searchParams={props.searchParams} />;
}
