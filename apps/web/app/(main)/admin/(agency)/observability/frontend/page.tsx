import { ObsFrontendPage } from "@/modules/observability/templates/frontend-page";

export default function Page(props: PageProps<"/admin/observability/frontend">) {
  return <ObsFrontendPage searchParams={props.searchParams} />;
}
