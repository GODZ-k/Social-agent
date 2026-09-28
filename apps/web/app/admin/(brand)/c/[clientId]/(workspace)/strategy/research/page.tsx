import StrategyResearchPage from "@/app/c/[clientId]/strategy/research/page";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

/** Same research page as `/c/[clientId]/strategy/research`, composed with the admin's own basePath. */
export default function AdminStrategyResearchPage(props: { params: Promise<{ clientId: string }> }) {
  return <StrategyResearchPage {...props} basePath="/admin/c" />;
}
