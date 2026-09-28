import type { Client, Viewer } from "@/lib/types";
import { TopBarFrame } from "./top-bar-frame";
import { BarDivider } from "./bar-divider";
import { BrandSwitcher } from "./brand-switcher";
import { AgentChatButton } from "./agent-chat-button";
import { AccountMenu } from "./account-menu";
import { toSwitcherBrand } from "./switcher-brand";

/** A client inside one of their brands: the brand switcher, "Ask the agent" and their account. */
export function WorkspaceHeader({ viewer, brand, brands }: { viewer: Viewer; brand: Client; brands: Client[] }) {
  const current = toSwitcherBrand(brand);
  const switchable = brands.map((item) => toSwitcherBrand(item));
  return (
    <TopBarFrame>
      <BarDivider />
      <BrandSwitcher current={current} brands={switchable} />
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <AgentChatButton client={brand} />
        <AccountMenu name={viewer.name} email={viewer.email} backToId={brand.id} />
      </div>
    </TopBarFrame>
  );
}
