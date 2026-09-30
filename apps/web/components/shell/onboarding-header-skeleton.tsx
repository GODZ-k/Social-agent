import { TopBarFrame } from "./top-bar-frame";

/** The onboarding bar while the signed-in person streams in: wordmark is known, the avatar is not. */
export function OnboardingHeaderSkeleton() {
  return (
    <TopBarFrame wordmark>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <div className="skeleton size-8 rounded-full" />
      </div>
    </TopBarFrame>
  );
}
