import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getViewer } from "@/lib/auth/viewer";
import { AdminHeaderSkeleton } from "@/components/shell/admin-header-skeleton";


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <Suspense fallback={<AdminHeaderSkeleton />}>
        <AdminOnly>{children}</AdminOnly>
      </Suspense>
    </div>
  );
}

async function AdminOnly({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  if (viewer.role !== "admin") notFound();
  return children;
}
