import OverviewPage from "@/app/c/[brandId]/page";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

/** Same overview as `/c/[brandId]`, composed with the admin's own basePath so every link stays under `/admin/c`. */
export default function AdminOverviewPage(props: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ post?: string }>;
}) {
  return <OverviewPage {...props} basePath="/admin/c" />;
}
