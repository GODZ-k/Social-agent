import AnalyticsPage from "@/app/c/[brandId]/analytics/page";

/** Same analytics body as `/c/[brandId]/analytics`, composed with the admin's own basePath. */
export default function AdminAnalyticsPage(props: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  return <AnalyticsPage {...props} basePath="/admin/c" />;
}
