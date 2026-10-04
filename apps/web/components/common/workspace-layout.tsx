import { Suspense } from "react";
import { WorkspaceChrome } from "@/components/shell/workspace-chrome";
import { WorkspaceChromeSkeleton } from "@/components/shell/workspace-chrome-skeleton";
import { getOnboarding } from "@/lib/api/server";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth/viewer";
import { WorkspaceBasePath } from "@/lib/workspace-path";


export default async function WorkspaceLayout({
  children,
  params,
  isAdmin = false,
  basePath = "/c"
}: {
  children: React.ReactNode;
  params: Promise<{ brandId: string }>;
  isAdmin?:boolean;
  basePath?:WorkspaceBasePath
}) {
    const { brandId } = await params;
    const viewer = await getViewer();
    if (viewer.role !== "admin" || !isAdmin){
      const onboarding = await getOnboarding(brandId);
      if (onboarding && onboarding.step !== "done") redirect(`/onboarding?brandId=${brandId}`);
    }
  return (
    <div className="min-h-dvh">
      <Suspense fallback={<WorkspaceChromeSkeleton />}>
        <WorkspaceChrome params={params} />
      </Suspense>
      {/* Bottom padding clears the tab bar on phones; left padding clears the rail on desktop. */}
      <main className="mx-auto max-w-[88rem] px-4 pt-7 pb-32 md:px-6 lg:pr-8 lg:pb-16 lg:pl-64">
        {children}
      </main>
    </div>
  );
}
