import { listAdminClients } from "@/lib/api/server";
import { PageHeaderInline } from "@repo/ui/components/states";
import { InviteClientButton } from "@/components/admin/invite-client-button";
import { AttentionTiles } from "@/components/admin/attention-tiles";
import { ClientsView } from "@/components/admin/clients-view";
import { NoClientsEmpty } from "@/components/admin/no-clients-empty";

export default async function AdminClientsPage({ searchParams }: { searchParams: Promise<{ invite?: string; filter?: string }> }) {
  const [clients, { invite, filter }] = await Promise.all([listAdminClients(), searchParams]);

  return (
    <>
      <PageHeaderInline
        title="Clients"
        description="Every business owner you manage, with what needs you first."
        actions={clients.length > 0 && <InviteClientButton defaultOpen={invite === "1"} />}
      />
      {clients.length === 0 ? (
        <NoClientsEmpty />
      ) : (
        <>
          <AttentionTiles clients={clients} />
          <ClientsView clients={clients} defaultFilter={filter === "needs-you" ? "needs-you" : "all"} />
        </>
      )}
    </>
  );
}
