import { notFound } from "next/navigation";
import { getClient, listClients } from "@/lib/api/server";
import { getViewer } from "@/lib/auth/viewer";
import { BrandTheme } from "@repo/ui/components/brand-theme";
import { TopBar } from "@/components/shell/top-bar";
import { WorkspaceNav } from "@/components/shell/workspace-nav";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const [viewer, client, clients] = await Promise.all([getViewer(), getClient(clientId), listClients()]);
  if (!client) notFound();

  return (
    <div className="min-h-dvh">
      <BrandTheme color={client.accent} />
      <TopBar viewer={viewer} client={client} clients={clients} />
      <WorkspaceNav clientId={clientId} pendingApprovals={client.stats.pendingApprovals} />
      {/* Bottom padding clears the tab bar on phones; left padding clears the rail on desktop. */}
      <main className="mx-auto max-w-[88rem] px-4 pt-7 pb-32 md:px-6 lg:pr-8 lg:pb-16 lg:pl-64">
        {children}
      </main>
    </div>
  );
}
