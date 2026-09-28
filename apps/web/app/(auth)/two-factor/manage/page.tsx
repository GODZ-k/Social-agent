import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@repo/ui/components/states";
import { getViewerRole } from "@/lib/auth/viewer";
import { Logo } from "@/components/shell/logo";
import { TwoFactorManage } from "@/features/auth/two-factor-manage";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = { title: "Two-factor sign-in" };

export default async function TwoFactorManagePage() {
  const role = await getViewerRole();
  if (!role) redirect("/sign-in");
  return (
    <main id="main" className="mx-auto w-full max-w-2xl px-4 pt-6 pb-16 sm:px-8">
      <Logo />
      <div className="mt-10">
        <PageHeader title="How you sign in" description="The second step after your password, and your backup codes." />
        <TwoFactorManage isAdmin={role === "admin"} />
      </div>
    </main>
  );
}
