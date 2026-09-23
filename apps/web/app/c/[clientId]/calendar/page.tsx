import { notFound } from "next/navigation";
import { getClient, getStrategy, listPosts } from "@/lib/api/server";
import { CalendarView } from "@/features/calendar/calendar-view";


// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function CalendarPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const [client, posts, strategy] = await Promise.all([getClient(clientId), listPosts(clientId), getStrategy(clientId)]);
  if (!client) notFound();

  return <CalendarView posts={posts} brand={client.brand} strategy={strategy} />;
}
