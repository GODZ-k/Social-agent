import { getClient, listClients } from "@/lib/api/server";
import { getViewer } from "@/lib/auth/viewer";
import type { WorkspaceBasePath } from "@/lib/workspace-path";
import { BrandTheme } from "@repo/ui/components/brand-theme";
import { TopBar } from "./top-bar";
import { AdminActingNote } from "./admin-acting-note";
import { WorkspaceNav } from "./workspace-nav";

/**
 * Header, nav and brand tint for one workspace. Async so the layout itself
 * stays instant: the chrome streams in under Suspense while the page's own
 * loading state shows. A missing brand leaves the bar without a switcher; the
 * page decides on notFound(). `basePath` tells every link inside whether it is
 * building the client's own tree or the admin's mirror of it.
 */
export async function WorkspaceChrome({ clientId, basePath = "/c" }: { clientId: string; basePath?: WorkspaceBasePath }) {
  const [viewer, client, clients] = await Promise.all([getViewer(), getClient(clientId), listClients()]);
  const actingForClient = client !== null && viewer.role === "admin";
  return (
    <>
      <BrandTheme color={client?.accent} />
      <TopBar viewer={viewer} client={client ?? undefined} clients={clients} basePath={basePath} />
      {actingForClient && <AdminActingNote />}
      {client && <WorkspaceNav clientId={clientId} pendingApprovals={client.stats.pendingApprovals} basePath={basePath} />}
    </>
  );
}
