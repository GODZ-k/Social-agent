import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getClient } from "@/lib/api/server";
import { AnalyticsBody } from "@/features/analytics/analytics-body";
import { PageHeader, SkeletonRows } from "@repo/ui/components/states";

export default async function AnalyticsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const client = await getClient(clientId);
  if (!client) notFound();

  return (
    <>
      <PageHeader title="Analytics" description="How published posts performed over the last 30 days, and what the agent took from it." />
      <Suspense fallback={<SkeletonRows rows={2} className="[&>*]:h-72" />}>
        <AnalyticsBody clientId={clientId} brand={client.brand} />
      </Suspense>
    </>
  );
}
