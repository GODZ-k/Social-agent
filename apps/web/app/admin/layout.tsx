import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getViewer } from "@/lib/auth/viewer";
import { AdminHeaderSkeleton } from "@/components/shell/admin-header-skeleton";

/**
 * Every admin route, agency chrome and brand workspace mirror alike: a non-admin
 * gets the plain not-found page, never a sign that this area exists. The two
 * chromes below this (`(agency)`, `(brand)/c`) each carry their own header and nav.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      {/*
       * The role check has to resolve before anything below renders, which puts the
       * whole admin tree behind this boundary and out of the prerendered shell. The
       * bar is the one piece both chromes underneath share, so it stands in as the
       * shell rather than leaving first paint blank.
       */}
      <Suspense fallback={<AdminHeaderSkeleton />}>
        <AdminOnly>{children}</AdminOnly>
      </Suspense>
    </div>
  );
}

/**
 * The role check streams rather than holding back the shell. Nothing below renders
 * until it passes: `children` is an element here, so its own reads only run once
 * this returns it. `proxy.ts` has already refused anyone signed out.
 */
async function AdminOnly({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  if (viewer.role !== "admin") notFound();
  return children;
}
