import { getViewer } from "@/lib/auth/viewer";
import { normalizeUrl } from "@/lib/utils";
import { TopBar } from "@/components/shell/top-bar";
import { OnboardingFlow } from "@/features/onboarding/onboarding-flow";

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ url?: string }> }) {
  const [viewer, { url }] = await Promise.all([getViewer(), searchParams]);

  return (
    <div className="min-h-dvh">
      <TopBar viewer={viewer} />
      <main className="mx-auto max-w-5xl px-4 pt-12 pb-24 md:px-6 md:pt-20">
        <OnboardingFlow initialUrl={normalizeUrl(url ?? "")} />
      </main>
    </div>
  );
}
