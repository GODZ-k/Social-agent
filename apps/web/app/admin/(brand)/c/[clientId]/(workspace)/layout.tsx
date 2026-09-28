import { Suspense } from "react";
import { WorkspaceChrome } from "@/components/shell/workspace-chrome";
import { WorkspaceChromeSkeleton } from "@/components/shell/workspace-chrome-skeleton";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

/**
 * The admin's mirror of `/c/[clientId]`: same chrome, `basePath="/admin/c"` so every
 * link inside stays under the admin tree. Renders at once, same as the client layout.
 */
export default async function AdminWorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  return (
    <div className="min-h-dvh">
      <Suspense fallback={<WorkspaceChromeSkeleton />}>
        <WorkspaceChrome clientId={clientId} basePath="/admin/c" />
      </Suspense>
      {/* Bottom padding clears the tab bar on phones; left padding clears the rail on desktop. */}
      <main className="mx-auto max-w-[88rem] px-4 pt-7 pb-32 md:px-6 lg:pr-8 lg:pb-16 lg:pl-64">
        {children}
      </main>
    </div>
  );
}
