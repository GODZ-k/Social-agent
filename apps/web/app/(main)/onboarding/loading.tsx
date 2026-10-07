import { OnboardingLoadingSkeleton } from "@/components/onboarding/onboarding-loading-skeleton";

/* The top bar needs the viewer, so only the main column is sketched while the page loads. */
export default function OnboardingLoading() {
  return (
    <div className="min-h-dvh">
      <main className="mx-auto max-w-5xl px-4 pt-8 pb-24 md:px-6 md:pt-12">
        <OnboardingLoadingSkeleton />
      </main>
    </div>
  );
}
