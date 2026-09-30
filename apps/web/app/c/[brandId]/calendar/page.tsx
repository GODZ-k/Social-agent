import { notFound } from "next/navigation";
import { getClient, getStrategy, listPosts } from "@/lib/api/server";
import type { WorkspaceBasePath } from "@/lib/workspace-path";
import { CalendarView } from "@/features/calendar/calendar-view";

export default async function CalendarPage({
  params,
  basePath = "/c",
}: {
  params: Promise<{ brandId: string }>;
  basePath?: WorkspaceBasePath;
}) {
  const { brandId } = await params;
  const [client, posts, strategy] = await Promise.all([getClient(brandId), listPosts(brandId), getStrategy(brandId)]);
  if (!client) notFound();

  return <CalendarView posts={posts} brand={client.brand} strategy={strategy} platforms={client.platforms} brandId={brandId} basePath={basePath} />;
}
