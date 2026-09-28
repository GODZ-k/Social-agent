import { getViewer } from "@/lib/auth/viewer";
import { OnboardingHeader } from "@/components/shell/onboarding-header";
import { ManualKitFlow } from "@/features/onboarding/manual-kit-flow";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

/** FL-1: filling in the brand kit by hand, reached from the scan-failed screen's "Fill it in" option. */
export default async function ManualBrandKitPage() {
  const viewer = await getViewer();
  return (
    <div className="min-h-dvh">
      <OnboardingHeader viewer={viewer} />
      <main className="mx-auto max-w-5xl px-4 pt-8 pb-24 md:px-6 md:pt-12">
        <ManualKitFlow />
      </main>
    </div>
  );
}
