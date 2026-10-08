import type { Metadata } from "next";
import { VerifyPage } from "@/modules/auth/templates/verify-page";

export const metadata: Metadata = { title: "Verify your email" };

export default function Page(props: PageProps<"/verify">) {
  return <VerifyPage searchParams={props.searchParams} />;
}
