import type { AnalyticsReport } from "@/lib/types";
import type { BrandKit } from "@social-agent/shared";
import { Panel } from "@repo/ui/components/states";
import { PostResultRow } from "./post-result-row";
import { bestPostReason, WORST_POST_REASON } from "./post-reason";
import { reachTotal } from "./report-format";

export function PostsPanel({ report, brand }: { report: AnalyticsReport; brand: BrandKit }) {
  if (report.bestPosts.length === 0) return null;
  const reach = reachTotal(report);
  const avgReach = report.postCount ? reach / report.postCount : 0;

  return (
    <Panel aria-labelledby="best-posts-heading">
      <h2 id="best-posts-heading" className="type-heading">
        Posts that worked best
      </h2>
      <p className="type-label mt-0.5">
        {report.phase === "month"
          ? `Top ${report.bestPosts.length} of ${report.postCount} posts, by people reached.`
          : "All posts so far, most people first."}
      </p>
      <ol className="mt-3 grid gap-1">
        {report.bestPosts.map((post, rank) => {
          const reason = bestPostReason(post, avgReach, rank);
          return <PostResultRow key={post.id} post={post} brand={brand} reason={reason} />;
        })}
      </ol>
      {report.worstPosts.length > 0 && (
        <>
          <p className="type-label mt-5 mb-1 font-semibold">Did least well</p>
          <ol className="grid gap-1">
            {report.worstPosts.map((post) => (
              <PostResultRow key={post.id} post={post} brand={brand} reason={WORST_POST_REASON} />
            ))}
          </ol>
        </>
      )}
    </Panel>
  );
}
