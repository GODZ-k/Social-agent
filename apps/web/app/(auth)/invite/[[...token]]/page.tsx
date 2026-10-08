import type { Metadata } from "next";
import { InvitePage } from "@/modules/auth/templates/invite-page";

export const metadata: Metadata = { title: "Accept your invite" };

export default function Page(props: PageProps<"/invite/[[...token]]">) {
  return <InvitePage params={props.params} searchParams={props.searchParams} />;
}
