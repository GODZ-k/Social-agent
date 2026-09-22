import { generatePosts } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";

const BATCH = 6;

/** Asks the agent for the next batch of posts; they land in the approval queue. */
export function useGeneratePosts(clientId: string) {
  const { run, isPending } = useServerAction(generatePosts, {
    success: (posts) => `${posts.length} posts drafted and sent for approval`,
  });
  return { generate: () => run(clientId, BATCH), isPending };
}
