import { notFound } from "next/navigation";
import { getAdminClient } from "@/lib/api/server";
import { InviteBanner } from "@/modules/admin/components/invite-banner";
import { ClientBrandsWorkspace } from "@/modules/admin/components/client-brands-workspace";
import { AboutClientPanel } from "@/modules/admin/components/about-client-panel";
import { AdminBrandCard } from "@/modules/admin/components/admin-brand-card";

export async function AdminClientPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const view = await getAdminClient(clientId);
  if (!view) notFound();
  const { client, brands, archivedBrands } = view;
  // AdminBrandCard is async and reads server-only data; it renders here, in the server template,
  // and is handed down as ready-made nodes so no client component ever imports it.
  const brandCards = brands.map((brand) => <AdminBrandCard key={brand.id} brand={brand} clientRow={client} />);

  return (
    <ClientBrandsWorkspace
      clientRow={client}
      brandCards={brandCards}
      archivedBrands={archivedBrands}
      inviteBanner={client.status === "invited" ? <InviteBanner client={client} /> : null}
      aboutPanel={<AboutClientPanel client={client} archivedCount={archivedBrands.length} />}
    />
  );
}
