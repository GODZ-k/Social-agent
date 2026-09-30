import { redirect } from "next/navigation";
import { listClients } from "@/lib/api/server";
import { getViewer } from "@/lib/auth/viewer";
import { TopBar } from "@/components/shell/top-bar";
import { ClientList } from "@/features/clients/client-list";
import { BrandTile } from "@/features/clients/brand-tile";
import { BrandSetupTile } from "@/features/clients/brand-setup-tile";

export default async function ClientsPage() {
  const [viewer, clients] = await Promise.all([getViewer(), listClients()]);

  if (viewer.role === "admin") redirect("/admin/clients");

  if (clients.length === 1) {
    const client = clients[0]!;
    redirect(client.stage === "onboarding" ? `/onboarding?clientId=${client.id}` : `/c/${client.id}`);
  }

  if (clients.length === 0) redirect("/onboarding");

  // A brand still in onboarding (site read and kit reviewed, nothing after that finished) gets
  // the setup tile instead of the live one; each tile is its own async component, per BA-1.
  const tiles = clients.map((client) =>
    client.stage === "onboarding" ? (
      <BrandSetupTile key={client.id} client={client} />
    ) : (
      <BrandTile key={client.id} client={client} basePath="/c" />
    ),
  );

  return (
    <div className="min-h-dvh">
      <TopBar viewer={viewer} />
      <main className="mx-auto max-w-[76rem] px-4 pt-14 pb-24 md:px-6 md:pt-24">
        <ClientList clients={clients} tiles={tiles} />
      </main>
    </div>
  );
}
