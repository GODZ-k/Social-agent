import StrategyPage from '@/modules/strategy/templates/strategy-page';
import { routes } from "@/config/routes";

/** Same strategy page as `/c/[brandId]/strategy`, composed with the admin's own basePath. */
export default function page(props: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ ask?: string }>;
}) {
  return <StrategyPage {...props} basePath={routes.admin.brand.base} />;
}
