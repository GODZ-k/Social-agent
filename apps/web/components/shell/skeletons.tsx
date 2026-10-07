import { TopBarFrame, BarDivider, RailFrame, TabBarFrame } from "./frames";
import { LOOP_ITEMS, TAB_ITEMS } from "./workspace-nav-items";

/**
 * What each area's chrome looks like while the signed-in person streams in. Each one uses the same
 * frames as the real thing, with placeholders only where request-time data goes, so nothing shifts
 * when the page resolves. Keep each in step with the bar it stands in for.
 */

/** The admin bar: wordmark, then placeholders for the badge and the avatar. */
export function AdminHeaderSkeleton() {
  return (
    <TopBarFrame wordmark>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton size-8 rounded-full" />
      </div>
    </TopBarFrame>
  );
}

/** The onboarding bar: the wordmark is known, the avatar is not. */
export function OnboardingHeaderSkeleton() {
  return (
    <TopBarFrame wordmark>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <div className="skeleton size-8 rounded-full" />
      </div>
    </TopBarFrame>
  );
}

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
