import { PageHeader } from "@repo/ui/components/states";

/**
 * The heading the four observability tabs share. It is the same on every one of
 * them, which is what lets it sit in the prefetched shell while the numbers stream.
 */
export function ObsPageHeader() {
  return <PageHeader title="Observability" description="How the app, the server and the AI agents are doing, across every client." />;
}
