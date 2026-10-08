import { notFound } from "next/navigation";
import { getBrand, getStrategy, listPosts } from "@/lib/api/server";
import { CalendarView } from "@/modules/calendar/components/calendar-view";
import { routes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

export default async function CalendarPage({
  params,
  basePath = routes.brand.base,
}: {
  params: Promise<{ brandId: string }>;
  basePath?: WorkspaceBase;
}) {
  const { brandId } = await params;
  const [brand, posts, strategy] = await Promise.all([getBrand(brandId), listPosts(brandId), getStrategy(brandId)]);
  if (!brand) notFound();

  return <CalendarView posts={posts} brand={brand.brand} strategy={strategy} platforms={brand.platforms} brandId={brandId} basePath={basePath} />;
}
