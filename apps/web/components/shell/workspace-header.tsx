import type { Brand, Viewer } from "@/lib/types";
import { TopBarFrame } from "./top-bar-frame";
import { BarDivider } from "./bar-divider";
import { BrandSwitcher } from "./brand-switcher";
import { AgentChatButton } from "./agent-chat-button";
import { AccountMenu } from "./account-menu";
import { toSwitcherBrand } from "./switcher-brand";

/** A brand inside one of their brands: the brand switcher, "Ask the agent" and their account. */
export function WorkspaceHeader({ viewer, brand, brands }: { viewer: Viewer; brand: Brand; brands: Brand[] }) {
  const current = toSwitcherBrand(brand);
  const switchable = brands.map((item) => toSwitcherBrand(item));
  return (
    <TopBarFrame>
      <BarDivider />
      <BrandSwitcher current={current} brands={switchable} />
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <AgentChatButton brand={brand} />
        <AccountMenu viewer={viewer} />
      </div>
    </TopBarFrame>
  );
}
