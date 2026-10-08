import type { Metadata } from "next";
import { SignInPage } from "@/modules/auth/templates/sign-in-page";

export const metadata: Metadata = { title: "Sign in" };

export default function Page(props: PageProps<"/sign-in">) {
  return <SignInPage searchParams={props.searchParams} />;
}
