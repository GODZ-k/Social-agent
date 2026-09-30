import { TopBarFrame } from "./top-bar-frame";

/** The admin bar's own shape while the signed-in person streams in: same frame, placeholders for the badge and avatar. */
export function AdminHeaderSkeleton() {
  return (
    <TopBarFrame>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton size-8 rounded-full" />
      </div>
    </TopBarFrame>
  );
}
