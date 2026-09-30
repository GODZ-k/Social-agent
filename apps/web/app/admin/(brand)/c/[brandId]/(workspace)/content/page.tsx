import ContentPage from "@/app/c/[brandId]/content/page";

/** Same content workspace as `/c/[brandId]/content`, composed with the admin's own basePath. */
export default function AdminContentPage(props: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ post?: string }>;
}) {
  return <ContentPage {...props} basePath="/admin/c" />;
}
