import type { AdminClientRow, BrandCard } from "@/lib/types";
import { AddBrandLink } from "./add-brand-link";
import { ClientHeader } from "./client-header";
import { BrandsSection } from "./brands-section";

/**
 * ADM-4: the client's brands, laid out with the about panel. Adding a brand (2026-09-28: the
 * full onboarding flow, not a dialog) is a link to `/onboarding?for=<clientId>`.
 */
export function ClientBrandsWorkspace({
  clientRow,
  brandCards,
  archivedBrands,
  inviteBanner,
  aboutPanel,
}: {
  clientRow: AdminClientRow;
  brandCards: React.ReactNode[];
  archivedBrands: BrandCard[];
  inviteBanner: React.ReactNode;
  aboutPanel: React.ReactNode;
}) {
  const personName = clientRow.name ?? clientRow.email;

  return (
    <div>
      <ClientHeader
        client={clientRow}
        action={brandCards.length > 0 && <AddBrandLink clientId={clientRow.id} personName={personName} size="sm" />}
      />
      {inviteBanner}
      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <BrandsSection clientRow={clientRow} personName={personName} brandCards={brandCards} archivedBrands={archivedBrands} />
        <div className="lg:sticky lg:top-24">{aboutPanel}</div>
      </div>
    </div>
  );
}
