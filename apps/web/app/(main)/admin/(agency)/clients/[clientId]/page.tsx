import { AdminClientPage } from "@/modules/admin/templates/client-page";

export default function Page(props: PageProps<"/admin/clients/[clientId]">) {
  return <AdminClientPage params={props.params} />;
}
