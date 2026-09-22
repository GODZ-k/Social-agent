import { SkeletonRows } from "@repo/ui/components/states";

/* The top bar needs the viewer, so only the main column is sketched while the page loads. */
export default function OnboardingLoading() {
  return (
    <div className="min-h-dvh">
      <main className="mx-auto max-w-5xl px-4 pt-12 pb-24 md:px-6 md:pt-20">
        <div className="mx-auto max-w-xl">
          <SkeletonRows rows={2} />
        </div>
      </main>
    </div>
  );
}
