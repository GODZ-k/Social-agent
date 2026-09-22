import { getClient, listClients } from "@/lib/api/server";
import { getViewer } from "@/lib/auth/viewer";
import { BrandTheme } from "@repo/ui/components/brand-theme";
import { TopBar } from "./top-bar";
import { WorkspaceNav } from "./workspace-nav";

/**
 * Top bar, nav and brand tint for one workspace. Async so the layout itself
 * stays instant: the chrome streams in under Suspense while the page's own
 * loading state shows. A missing client leaves the bar without a switcher; the
 * page decides on notFound().
 */
export async function WorkspaceChrome({ clientId }: { clientId: string }) {
  const [viewer, client, clients] = await Promise.all([getViewer(), getClient(clientId), listClients()]);
  return (
    <>
      <BrandTheme color={client?.accent} />
      <TopBar viewer={viewer} client={client ?? undefined} clients={clients} />
      {client && <WorkspaceNav clientId={clientId} pendingApprovals={client.stats.pendingApprovals} />}
    </>
  );
}
