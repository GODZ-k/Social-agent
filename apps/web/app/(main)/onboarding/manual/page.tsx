import { Suspense } from "react";
import { getViewer } from "@/lib/auth/viewer";
import { OnboardingHeaderSkeleton } from "@/components/shell/onboarding-header-skeleton";
import { ManualKitFlow } from "@/features/onboarding/manual-kit-flow";
import { TopBar } from "@/components/shell/top-bar";

/** FL-1: filling in the brand kit by hand, reached from the scan-failed screen's "Fill it in" option. */
export default function ManualBrandKitPage() {
  return (
    <div className="min-h-dvh">
      <Suspense fallback={<OnboardingHeaderSkeleton />}>
        <SignedInHeader />
      </Suspense>
      <main className="mx-auto max-w-5xl px-4 pt-8 pb-24 md:px-6 md:pt-12">
        <ManualKitFlow />
      </main>
    </div>
  );
}

/** The only request-time read on this page, kept off the form so the form prerenders. */
async function SignedInHeader() {
  const viewer = await getViewer();
  return <TopBar viewer={viewer} />;
}
