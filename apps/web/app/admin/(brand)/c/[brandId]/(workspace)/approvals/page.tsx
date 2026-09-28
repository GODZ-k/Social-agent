import ApprovalsPage from "@/app/c/[brandId]/approvals/page";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

/** Same approvals stack as `/c/[brandId]/approvals`, composed with the admin's own basePath. */
export default function AdminApprovalsPage(props: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ post?: string }>;
}) {
  return <ApprovalsPage {...props} basePath="/admin/c" />;
}
