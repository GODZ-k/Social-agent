import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader, Panel } from "@repo/ui/components/states";
import { getViewerRole } from "@/lib/auth/viewer";
import { Logo } from "@/components/shell/logo";
import { TwoFactorManage } from "@/features/auth/two-factor-manage";

export const metadata: Metadata = { title: "Two-factor sign-in" };

export default function TwoFactorManagePage() {
  return (
    <main id="main" className="mx-auto w-full max-w-2xl px-4 pt-6 pb-16 sm:px-8">
      <Logo />
      <div className="mt-10">
        <PageHeader title="How you sign in" description="The second step after your password, and your backup codes." />
        <Suspense fallback={<MethodsSkeleton />}>
          <Methods />
        </Suspense>
      </div>
    </main>
  );
}

/** The role decides the copy and whether two-factor can be turned off, so it streams under the heading. */
async function Methods() {
  const role = await getViewerRole();
  if (!role) redirect("/sign-in");
  return <TwoFactorManage isAdmin={role === "admin"} />;
}

function MethodsSkeleton() {
  return (
    <Panel aria-busy aria-label="Loading">
      <div className="skeleton h-5.5 w-44 rounded-full" />
      <div className="skeleton mt-2 h-4 w-72 max-w-full rounded-full" />
      <div className="mt-5 grid gap-3">
        <div className="skeleton h-16 w-full rounded-xl" />
        <div className="skeleton h-16 w-full rounded-xl" />
      </div>
    </Panel>
  );
}
