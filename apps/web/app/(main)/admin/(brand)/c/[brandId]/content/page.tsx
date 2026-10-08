import ContentPage from "@/modules/content/templates/content-page";
import { routes } from "@/config/routes";

/** Same content workspace as `/c/[brandId]/content`, composed with the admin's own basePath. */
export default function AdminContentPage(props: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ post?: string }>;
}) {
  return <ContentPage {...props} basePath={routes.admin.brand.base} />;
}
