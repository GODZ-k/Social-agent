import StrategyPage from "@/app/c/[brandId]/strategy/page";

/** Same strategy page as `/c/[brandId]/strategy`, composed with the admin's own basePath. */
export default function AdminStrategyPage(props: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ ask?: string }>;
}) {
  return <StrategyPage {...props} basePath="/admin/c" />;
}
