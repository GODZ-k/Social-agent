import { TopBarFrame } from "./top-bar-frame";
import { BarDivider } from "./bar-divider";
import { RailFrame } from "./rail-frame";
import { TabBarFrame } from "./tab-bar-frame";
import { LOOP_ITEMS, TAB_ITEMS } from "./workspace-nav-items";

/** Same bar, rail and tab bar as the real chrome, with placeholders where the brand's name and links go. */
export function WorkspaceChromeSkeleton() {
  return (
    <>
      <TopBarFrame>
        <BarDivider />
        <div className="skeleton h-7.5 w-36 rounded-full" />
        <div className="ml-auto flex items-center gap-2">
          <div className="skeleton h-8.5 w-32 rounded-full max-[560px]:w-9" />
          <div className="skeleton size-8 rounded-full" />
        </div>
      </TopBarFrame>
      <RailFrame label="Workspace">
        {LOOP_ITEMS.map((item) => (
          <div key={item.segment} className="flex h-10 items-center px-3">
            <div className="skeleton h-4 w-24 rounded-sm" />
          </div>
        ))}
      </RailFrame>
      <TabBarFrame label="Workspace">
        {[...TAB_ITEMS, "more"].map((_, index) => (
          <div key={index} className="flex justify-center py-1.5">
            <div className="skeleton size-5 rounded-md" />
          </div>
        ))}
      </TabBarFrame>
    </>
  );
}
