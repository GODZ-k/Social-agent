import ApprovalsPage from "@/components/approvals/approval-page";

/** Same approvals stack as `/c/[brandId]/approvals`, composed with the admin's own basePath. */
export default function AdminApprovalsPage(props: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ post?: string }>;
}) {
  return <ApprovalsPage {...props} basePath="/admin/c" />;
}
