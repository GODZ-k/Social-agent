import { ObsAgentsPage } from "@/modules/observability/templates/agents-page";

export default function Page(props: PageProps<"/admin/observability/agents">) {
  return <ObsAgentsPage searchParams={props.searchParams} />;
}
