import { AdminClientsPage } from "@/modules/admin/templates/clients-page";

export default function Page(props: PageProps<"/admin/clients">) {
  return <AdminClientsPage searchParams={props.searchParams} />;
}
