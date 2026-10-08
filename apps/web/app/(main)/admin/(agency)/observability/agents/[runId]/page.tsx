import { AgentRunPage } from "@/modules/observability/templates/agent-run-page";

export default function Page(props: PageProps<"/admin/observability/agents/[runId]">) {
  return <AgentRunPage params={props.params} />;
}
