import StrategyResearchPage from "@/app/c/[brandId]/strategy/research/page";

/** Same research page as `/c/[brandId]/strategy/research`, composed with the admin's own basePath. */
export default function AdminStrategyResearchPage(props: { params: Promise<{ brandId: string }> }) {
  return <StrategyResearchPage {...props} basePath="/admin/c" />;
}
