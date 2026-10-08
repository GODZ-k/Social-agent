import { ObsOverviewPage } from "@/modules/observability/templates/overview-page";

export default function Page(props: PageProps<"/admin/observability">) {
  return <ObsOverviewPage searchParams={props.searchParams} />;
}
