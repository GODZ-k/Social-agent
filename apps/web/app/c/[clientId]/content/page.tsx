import { notFound } from "next/navigation";
import { getClient, listContent } from "@/lib/api/server";
import { PageHeader } from "@repo/ui/components/states";
import { ContentView } from "@/features/content/content-view";
import { GeneratePostsButton } from "@/features/content/generate-posts-button";
import { GenerateFirstPostsButton } from "@/features/content/generate-first-posts-button";
import { ReviewPostSheet } from "@/features/post/review-post-sheet";


// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function ContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ post?: string }>;
}) {
  const [{ clientId }, { post: postId }] = await Promise.all([params, searchParams]);
  const [client, posts] = await Promise.all([getClient(clientId), listContent(clientId)]);
  if (!client) notFound();

  return (
    <>
      <PageHeader
        title="Content"
        description="Every post the agent drafted, from first draft to published."
        actions={<GeneratePostsButton clientId={clientId} />}
      />
      <ContentView posts={posts} brand={client.brand}>
        <GenerateFirstPostsButton clientId={clientId} />
      </ContentView>
      {postId && <ReviewPostSheet postId={postId} />}
    </>
  );
}
