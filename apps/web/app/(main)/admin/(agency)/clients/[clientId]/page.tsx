import { notFound } from "next/navigation";
import { getAdminClient } from "@/lib/api/server";
import { InviteBanner } from "@/components/admin/invite-banner";
import { ClientBrandsWorkspace } from "@/components/admin/client-brands-workspace";
import { AboutClientPanel } from "@/components/admin/about-client-panel";
import { AdminBrandCard } from "@/components/admin/admin-brand-card";

export default async function AdminClientPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const view = await getAdminClient(clientId);
  if (!view) notFound();
  const { client, brands, archivedBrands } = view;
  // AdminBrandCard is async and reads server-only data; it renders here, in the server page,
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
