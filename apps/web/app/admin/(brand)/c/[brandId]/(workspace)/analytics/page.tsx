import AnalyticsPage from "@/app/c/[brandId]/analytics/page";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

/** Same analytics body as `/c/[brandId]/analytics`, composed with the admin's own basePath. */
export default function AdminAnalyticsPage(props: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  return <AnalyticsPage {...props} basePath="/admin/c" />;
}
