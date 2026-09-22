import { UpcomingPostsPanel } from "./upcoming-posts";

export function UpcomingPostsSkeleton({ clientId }: { clientId: string }) {
  return (
    <UpcomingPostsPanel clientId={clientId}>
      <div className="flex gap-4" aria-busy aria-label="Loading upcoming posts">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="skeleton aspect-[4/5] w-40 shrink-0 rounded-lg" />
        ))}
      </div>
    </UpcomingPostsPanel>
  );
}
