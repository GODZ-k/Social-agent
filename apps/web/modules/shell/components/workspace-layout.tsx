import { Suspense } from "react";
import { WorkspaceChrome } from "./workspace-chrome";
import { WorkspaceChromeSkeleton } from "./skeletons";
import { getOnboarding } from "@/lib/api/server";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth/viewer";
import { routes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

export default async function WorkspaceLayout({
  children,
  params,
  isAdmin = false,
  basePath = routes.brand.base,
}: {
  children: React.ReactNode;
  params: Promise<{ brandId: string }>;
  isAdmin?: boolean;
  basePath?: WorkspaceBase;
}) {
  const { brandId } = await params;
  const viewer = await getViewer();
  if (viewer.role !== "admin" || !isAdmin) {
    const onboarding = await getOnboarding(brandId);
    if (onboarding && onboarding.step !== "done") redirect(routes.onboarding.resume(brandId));
  }
  return (
    <div className="min-h-dvh">
      <Suspense fallback={<WorkspaceChromeSkeleton />}>
        {/* `basePath` decides whether the bar and nav link into the brand's own tree or the admin
            mirror of it, so it has to reach the chrome, not stop here. */}
        <WorkspaceChrome params={params} basePath={basePath} />
      </Suspense>
      {/* Bottom padding clears the tab bar on phones; left padding clears the rail on desktop. */}
      <main className="mx-auto max-w-[88rem] px-4 pt-7 pb-32 md:px-6 lg:pr-8 lg:pb-16 lg:pl-64">
        {children}
      </main>
    </div>
  );
}
