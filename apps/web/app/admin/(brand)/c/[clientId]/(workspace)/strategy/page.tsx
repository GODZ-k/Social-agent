import StrategyPage from "@/app/c/[clientId]/strategy/page";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

/** Same strategy page as `/c/[clientId]/strategy`, composed with the admin's own basePath. */
export default function AdminStrategyPage(props: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ ask?: string }>;
}) {
  return <StrategyPage {...props} basePath="/admin/c" />;
}
