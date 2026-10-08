import AnalyticsPage from "@/modules/analytics/templates/analytics-page";
import { routes } from "@/config/routes";

/** Same analytics body as `/c/[brandId]/analytics`, composed with the admin's own basePath. */
export default function AdminAnalyticsPage(props: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  return <AnalyticsPage {...props} basePath={routes.admin.brand.base} />;
}
