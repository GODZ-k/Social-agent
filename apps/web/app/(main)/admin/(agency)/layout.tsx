import { Suspense } from "react";
import { AdminHeaderSkeleton } from "@/components/shell/admin-header-skeleton";
import { AdminNav } from "@/components/shell/admin-nav";
import { getViewer } from "@/lib/auth/viewer";
import { TopBar } from "@/components/shell/top-bar";

/** The agency's own area: Clients and Observability. Role gate lives in the admin layout above this group. */
export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<AdminHeaderSkeleton />}>
        <SignedInAdminHeader />
      </Suspense>
      <AdminNav />
      <main className="mx-auto max-w-[88rem] px-4 pt-7 pb-32 md:px-6 lg:pr-8 lg:pb-16 lg:pl-64">{children}</main>
    </>
  );
}

/** Split out so the one request-time read in this layout streams instead of holding back the shell. */
async function SignedInAdminHeader() {
  const viewer = await getViewer();
  return <TopBar viewer={viewer} />;
}
