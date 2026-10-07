import OverviewPage from "@/components/overview/overview-page";

/** Same overview as `/c/[brandId]`, composed with the admin's own basePath so every link stays under `/admin/c`. */
export default function AdminOverviewPage(props: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ post?: string }>;
}) {
  return <OverviewPage {...props} basePath="/admin/c" />;
}
