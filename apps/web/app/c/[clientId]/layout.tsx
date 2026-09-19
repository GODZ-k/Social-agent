"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { clientQuery } from "@/lib/api/queries";
import { BrandTheme } from "@repo/ui/components/brand-theme";
import { TopBar } from "@/components/shell/top-bar";
import { WorkspaceNav } from "@/components/shell/workspace-nav";
import { ErrorState } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { clientId } = useParams<{ clientId: string }>();
  const { data: client, error, refetch } = useQuery(clientQuery(clientId));

  return (
    <div className="min-h-dvh">
      <BrandTheme color={client?.accent} />
      <TopBar client={client} />
      {error ? (
        <main className="px-4">
          <ErrorState error={error} onRetry={() => refetch()} />
          <div className="flex justify-center">
            <Button asChild variant="ghost">
              <Link href="/">Back to all clients</Link>
            </Button>
          </div>
        </main>
      ) : (
        <>
          <WorkspaceNav clientId={clientId} pendingApprovals={client?.stats.pendingApprovals ?? 0} />
          {/* Bottom padding clears the tab bar on phones; left padding clears the rail on desktop. */}
          <main className="mx-auto max-w-[88rem] px-4 pt-7 pb-32 md:px-6 lg:pr-8 lg:pb-16 lg:pl-64">
            {children}
          </main>
        </>
      )}
    </div>
  );
}
