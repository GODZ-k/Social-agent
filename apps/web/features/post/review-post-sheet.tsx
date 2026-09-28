import dynamic from "next/dynamic";
import { getBestTimes, getClient, getPost, listReviewQueue, listSocialAccounts } from "@/lib/api/server";

// The picker components are heavy (a clock face library, a calendar); nobody
// needs them until a post is actually opened for review.
const ReviewPostPanel = dynamic(() => import("./review-post-panel").then((m) => m.ReviewPostPanel));

/**
 * The one review panel (S08). Every "Review" button, and the overview and
 * content agent, open it the same way: `?post=<id>`.
 */
export async function ReviewPostSheet({ postId }: { postId: string }) {
  const post = await getPost(postId);
  if (!post) return null;

  const scheduledDate = (post.scheduledFor ?? new Date().toISOString()).slice(0, 10);
  const [client, queue, accounts, bestTimes] = await Promise.all([
    getClient(post.clientId),
    listReviewQueue(post.clientId),
    listSocialAccounts(post.clientId),
    getBestTimes(post.clientId, post.platform, scheduledDate),
  ]);
  if (!client) return null;

  const account = accounts.find((a) => a.platform === post.platform);
  const index = queue.findIndex((p) => p.id === post.id);

  return (
    <ReviewPostPanel
      post={post}
      brand={client.brand}
      bestTimes={bestTimes}
      connected={account?.state === "connected"}
      position={index === -1 ? null : index + 1}
      total={queue.length}
      prevId={index > 0 ? queue[index - 1]!.id : null}
      nextId={index !== -1 && index < queue.length - 1 ? queue[index + 1]!.id : null}
    />
  );
}
