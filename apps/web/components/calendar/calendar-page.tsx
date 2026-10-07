import { notFound } from "next/navigation";
import { getBrand, getStrategy, listPosts } from "@/lib/api/server";
import type { WorkspaceBasePath } from "@/lib/workspace-path";
import { CalendarView } from "@/components/calendar/calendar-view";

export default async function CalendarPage({
  params,
  basePath = "/c",
}: {
  params: Promise<{ brandId: string }>;
  basePath?: WorkspaceBasePath;
}) {
  const { brandId } = await params;
  const [brand, posts, strategy] = await Promise.all([getBrand(brandId), listPosts(brandId), getStrategy(brandId)]);
  if (!brand) notFound();

  return <CalendarView posts={posts} brand={brand.brand} strategy={strategy} platforms={brand.platforms} brandId={brandId} basePath={basePath} />;
}
