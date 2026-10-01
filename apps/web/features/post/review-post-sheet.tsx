import dynamic from "next/dynamic";
import { getAnalyticsReport, getBestTimes, getBrand, getPost, listReviewQueue, listSocialAccounts } from "@/lib/api/server";
import { reachTotal } from "@/features/analytics/report-format";

// The picker components are heavy (a clock face library, a calendar); nobody
// needs them until a post is actually opened for review.
const ReviewPostPanel = dynamic(() => import("./review-post-panel").then((m) => m.ReviewPostPanel));
const FailedSizePanel = dynamic(() => import("./failed-size-panel").then((m) => m.FailedSizePanel));
const FailedConnectionPanel = dynamic(() => import("./failed-connection-panel").then((m) => m.FailedConnectionPanel));
const PublishedPostPanel = dynamic(() => import("./published-post-panel").then((m) => m.PublishedPostPanel));

/**
 * The one review panel (S08), plus the failed (FL-2) and published (FL-3) panels for posts that
 * are past approval. Every "Review"/"See why" button, and the overview and content agent, open
 * one of them the same way: `?post=<id>`.
 */
export async function ReviewPostSheet({ postId }: { postId: string }) {
  const post = await getPost(postId);
  if (!post) return null;

  const scheduledDate = (post.scheduledFor ?? new Date().toISOString()).slice(0, 10);
  const [brand, queue, accounts, bestTimes] = await Promise.all([
    getBrand(post.brandId),
    listReviewQueue(post.brandId),
    listSocialAccounts(post.brandId),
    getBestTimes(post.brandId, post.platform, scheduledDate),
  ]);
  if (!brand) return null;

  const account = accounts.find((a) => a.platform === post.platform);
  const connected = account?.state === "connected";

  // A post the network refused is fixed by changing it; one whose account expired is fixed by
  // reconnecting. Both clear `failure` the same way (reschedulePost), so the account's own
  // connection state is what tells the two apart — no extra field on the post itself.
  if (post.state === "failed") {
    return connected ? <FailedSizePanel post={post} brand={brand.brand} /> : <FailedConnectionPanel post={post} brand={brand.brand} />;
  }

  if (post.state === "published") {
    const report = await getAnalyticsReport(post.brandId);
    const bestRankFound = report?.bestPosts.findIndex((p) => p.id === post.id) ?? -1;
    const bestRank = bestRankFound === -1 ? null : bestRankFound;
    const avgReach = report && report.postCount ? reachTotal(report) / report.postCount : 0;
    return <PublishedPostPanel post={post} brand={brand.brand} handle={account?.handle ?? null} bestRank={bestRank} avgReach={avgReach} />;
  }

  const index = queue.findIndex((p) => p.id === post.id);

  return (
    <ReviewPostPanel
      post={post}
      brand={brand.brand}
      bestTimes={bestTimes}
      connected={connected}
      position={index === -1 ? null : index + 1}
      total={queue.length}
      prevId={index > 0 ? queue[index - 1]!.id : null}
      nextId={index !== -1 && index < queue.length - 1 ? queue[index + 1]!.id : null}
    />
  );
}
