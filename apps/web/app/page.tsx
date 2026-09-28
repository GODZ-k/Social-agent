import { redirect } from "next/navigation";
import { listClients } from "@/lib/api/server";
import { getViewer } from "@/lib/auth/viewer";
import { TopBar } from "@/components/shell/top-bar";
import { ClientsHero } from "@/features/clients/clients-hero";
import { ClientList } from "@/features/clients/client-list";
import { BrandTile } from "@/features/clients/brand-tile";
import { BrandSetupTile } from "@/features/clients/brand-setup-tile";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function ClientsPage() {
  const [viewer, clients] = await Promise.all([getViewer(), listClients()]);

  // The agency's own area now lives at /admin/clients; this page is the client view only.
  if (viewer.role === "admin") redirect("/admin/clients");

  // Someone with a single brand has nothing to choose between: take them straight to it.
  if (clients.length === 1) redirect(`/c/${clients[0]!.id}`);

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
        {/* A new account has no brands yet, so there is no grid to show: the URL field is the page. */}
        {clients.length === 0 ? <ClientsHero isAdmin={false} /> : <ClientList clients={clients} tiles={tiles} />}
      </main>
    </div>
  );
}
