import { Suspense } from "react";
import { AdminHeaderSkeleton } from "@/modules/shell/components/skeletons";
import { AdminNav } from "@/modules/shell/components/admin-nav";
import { SignedInTopBar } from "@/modules/shell/components/top-bar";

/** The agency's own area: Clients and Observability. Role gate lives in the admin layout above this group. */
export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* The bar's one request-time read streams instead of holding back the shell. */}
      <Suspense fallback={<AdminHeaderSkeleton />}>
        <SignedInTopBar />
      </Suspense>
      <AdminNav />
      <main className="mx-auto max-w-[88rem] px-4 pt-7 pb-32 md:px-6 lg:pr-8 lg:pb-16 lg:pl-64">{children}</main>
    </>
  );
}
