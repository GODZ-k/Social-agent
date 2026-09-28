import { UserPlus } from "lucide-react";
import type { AdminClientRow, BrandCard } from "@/lib/types";
import { EmptyState } from "@repo/ui/components/states";
import { AddBrandLink } from "./add-brand-link";
import { ArchivedBrandsToggle } from "./archived-brands-toggle";

/**
 * Every brand for this client. `brandCards` come pre-rendered from the server page (each is
 * an `AdminBrandCard`, an async server component), so this file never imports that module itself.
 */
export function BrandsSection({
  clientRow,
  personName,
  brandCards,
  archivedBrands,
}: {
  clientRow: AdminClientRow;
  personName: string;
  brandCards: React.ReactNode[];
  archivedBrands: BrandCard[];
}) {
  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="type-heading">Brands</h2>
        {clientRow.needsYou && <p className="type-label">Needs you first</p>}
      </div>

      {brandCards.length === 0 ? (
        <EmptyState
          icon={<UserPlus />}
          title="No brand yet"
          description={`${personName} can add their website after they sign in. Or set it up now, so their brand kit is waiting when they arrive.`}
          action={<AddBrandLink clientId={clientRow.id} personName={personName} />}
        />
      ) : (
        <div className="grid gap-4">{brandCards}</div>
      )}

      {archivedBrands.length > 0 && <ArchivedBrandsToggle brands={archivedBrands} />}
    </div>
  );
}
