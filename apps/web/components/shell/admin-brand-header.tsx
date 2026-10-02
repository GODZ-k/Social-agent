import type { Brand, Viewer } from "@/lib/types";
import type { WorkspaceBasePath } from "@/lib/workspace-path";
import { Badge } from "@repo/ui/components/badge";
import { TopBarFrame } from "./top-bar-frame";
import { BarDivider } from "./bar-divider";
import { CrumbSlash } from "./crumb-slash";
import { ClientsBackLink } from "./clients-back-link";
import { BrandSwitcher } from "./client-switcher";
import { AgentChatButton } from "./agent-chat-button";
import { AccountMenu } from "./account-menu";
import { toSwitcherBrand } from "./switcher-brand";

/**
 * An admin inside a client's brand: "‹ Clients / Brand", with whose brand it is
 * under the name, and the Admin badge. `ownerNames` maps a brand's ownerId to
 * the owner's name, when the page has it.
 */
export function AdminBrandHeader({
  viewer,
  brand,
  brands,
  ownerNames = {},
  basePath = "/c",
}: {
  viewer: Viewer;
  brand: Brand;
  brands: Brand[];
  ownerNames?: Record<string, string>;
  basePath?: WorkspaceBasePath;
}) {
  const current = toSwitcherBrand(brand, ownerNames[brand.ownerId]);
  const switchable = brands.map((item) => toSwitcherBrand(item, ownerNames[item.ownerId]));
  return (
    <TopBarFrame>
      <BarDivider />
      <ClientsBackLink />
      <CrumbSlash />
      <BrandSwitcher current={current} brands={switchable} basePath={basePath} />
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <AgentChatButton brand={brand} basePath={basePath} />
        <Badge variant="outline" className="border-input text-foreground max-md:hidden">
          Admin
        </Badge>
        <AccountMenu viewer={viewer} />
      </div>
    </TopBarFrame>
  );
}
