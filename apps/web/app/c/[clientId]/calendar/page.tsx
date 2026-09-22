import { notFound } from "next/navigation";
import { getClient, getStrategy, listPosts } from "@/lib/api/server";
import { CalendarView } from "@/features/calendar/calendar-view";

export default async function CalendarPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const [client, posts, strategy] = await Promise.all([getClient(clientId), listPosts(clientId), getStrategy(clientId)]);
  if (!client) notFound();

  return <CalendarView posts={posts} brand={client.brand} strategy={strategy} />;
}
