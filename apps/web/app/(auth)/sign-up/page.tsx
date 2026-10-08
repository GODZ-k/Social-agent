import type { Metadata } from "next";
import { SignUpPage } from "@/modules/auth/templates/sign-up-page";

export const metadata: Metadata = { title: "Create your account" };

export default function Page(props: PageProps<"/sign-up">) {
  return <SignUpPage searchParams={props.searchParams} />;
}
