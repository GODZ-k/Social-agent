import ContentPage from "@/app/c/[brandId]/content/page";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

/** Same content workspace as `/c/[brandId]/content`, composed with the admin's own basePath. */
export default function AdminContentPage(props: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ post?: string }>;
}) {
  return <ContentPage {...props} basePath="/admin/c" />;
}
