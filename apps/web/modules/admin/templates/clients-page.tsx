import { PageHeaderInline } from "@repo/ui/components/states";
import { listAdminClients } from "@/lib/api/server";
import type { RouteSearchParams } from "@/lib/types";
import { InviteClientButton } from "@/modules/admin/components/invite-client-button";
import { AttentionTiles } from "@/modules/admin/components/attention-tiles";
import { ClientsView } from "@/modules/admin/components/clients-view";
import { NoClientsEmpty } from "@/modules/admin/components/no-clients-empty";

export async function AdminClientsPage({ searchParams }: { searchParams: RouteSearchParams }) {
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
