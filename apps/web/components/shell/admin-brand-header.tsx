import type { Client, Viewer } from "@/lib/types";
import type { WorkspaceBasePath } from "@/lib/workspace-path";
import { Badge } from "@repo/ui/components/badge";
import { ThemeMenu } from "@repo/ui/components/theme-menu";
import { TopBarFrame } from "./top-bar-frame";
import { BarDivider } from "./bar-divider";
import { ClientsBackLink } from "./clients-back-link";
import { ClientSwitcher } from "./client-switcher";
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
  brand: Client;
  brands: Client[];
  ownerNames?: Record<string, string>;
  basePath?: WorkspaceBasePath;
}) {
  const current = toSwitcherBrand(brand, ownerNames[brand.ownerId]);
  const switchable = brands.map((item) => toSwitcherBrand(item, ownerNames[item.ownerId]));
  return (
    <TopBarFrame>
      <BarDivider />
      <ClientsBackLink />
      <span aria-hidden className="text-lg leading-none text-input max-[560px]:hidden">
        /
      </span>
      <ClientSwitcher current={current} brands={switchable} basePath={basePath} />
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <AgentChatButton client={brand} basePath={basePath} />
        <ThemeMenu />
        <Badge variant="outline" className="border-input text-foreground max-md:hidden">
          Admin
        </Badge>
        <AccountMenu name={viewer.name} email={viewer.email} backToId={brand.id} />
      </div>
    </TopBarFrame>
  );
}
