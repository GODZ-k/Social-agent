import type { Viewer } from "@/lib/types";
import { Badge } from "@repo/ui/components/badge";
import { TopBarFrame } from "./top-bar-frame";
import { BarDivider } from "./bar-divider";
import { CrumbSlash } from "./crumb-slash";
import { ClientsBackLink } from "./clients-back-link";
import { AccountMenu } from "./account-menu";

/**
 * An admin building a brand for a brand that does not exist yet (2026-09-28): "‹ Clients /
 * <name>'s new brand". Same crumb as `AdminBrandHeader`, but there is no brand to switch to yet.
 */
export function AdminOnboardingHeader({ viewer, personName }: { viewer: Viewer; personName: string }) {
  return (
    <TopBarFrame wordmark>
      <BarDivider />
      <ClientsBackLink />
      <CrumbSlash />
      <span className="type-label truncate text-foreground max-[560px]:hidden">{personName}&rsquo;s new brand</span>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Badge variant="outline" className="border-input text-foreground max-md:hidden">
          Admin
        </Badge>
        <AccountMenu viewer={viewer} />
      </div>
    </TopBarFrame>
  );
}
