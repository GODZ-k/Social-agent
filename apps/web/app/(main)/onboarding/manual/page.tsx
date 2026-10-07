import { Suspense } from "react";
import { BackLink } from "@/components/shell/back-link";
import { OnboardingHeaderSkeleton } from "@/components/shell/skeletons";
import { SignedInTopBar } from "@/components/shell/top-bar";
import { ManualKitFlow } from "@/components/onboarding/manual-kit-flow";

/** FL-1: filling in the brand kit by hand, reached from the scan-failed screen's "Fill it in" option. */
export default function ManualBrandKitPage() {
  return (
    <div className="min-h-dvh">
      {/* The bar is the only request-time read on this page, so the form beside it prerenders. */}
      <Suspense fallback={<OnboardingHeaderSkeleton />}>
        <SignedInTopBar />
      </Suspense>
      <main className="mx-auto max-w-5xl px-4 pt-8 pb-24 md:px-6 md:pt-12">
        <BackLink href="/onboarding" label="Start from your website" className="mb-3" />
        <ManualKitFlow />
      </main>
    </div>
  );
}
