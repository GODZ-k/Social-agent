import ApprovalsPage from "@/modules/approvals/templates/approval-page";
import { routes } from "@/config/routes";

/** Same approvals stack as `/c/[brandId]/approvals`, composed with the admin's own basePath. */
export default function AdminApprovalsPage(props: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ post?: string }>;
}) {
  return <ApprovalsPage {...props} basePath={routes.admin.brand.base} />;
}
