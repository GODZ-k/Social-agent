import { FrontendErrorPage } from "@/modules/observability/templates/frontend-error-page";

export default function Page(props: PageProps<"/admin/observability/frontend/[errorId]">) {
  return <FrontendErrorPage params={props.params} />;
}
