import { notFound } from "next/navigation";
import { getClient, getStrategy, listPosts } from "@/lib/api/server";
import { PageHeader } from "@repo/ui/components/states";
import { ContentView } from "@/features/content/content-view";
import { GeneratePostsButton } from "@/features/content/generate-posts-button";
import { GenerateFirstPostsButton } from "@/features/content/generate-first-posts-button";


// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function ContentPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const [client, posts, strategy] = await Promise.all([getClient(clientId), listPosts(clientId), getStrategy(clientId)]);
  if (!client) notFound();

  return (
    <>
      <PageHeader
        title="Content"
        description="Every post the agent has drafted for this client, from first draft to published."
        actions={<GeneratePostsButton clientId={clientId} />}
      />
      <ContentView posts={posts} strategy={strategy} brand={client.brand}>
        <GenerateFirstPostsButton clientId={clientId} />
      </ContentView>
    </>
  );
}
