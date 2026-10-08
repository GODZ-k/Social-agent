import { ObsServerPage } from "@/modules/observability/templates/server-page";

export default function Page(props: PageProps<"/admin/observability/server">) {
  return <ObsServerPage searchParams={props.searchParams} />;
}
