import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import type { BrandKit, Post } from "@/lib/types";
import { EmptyState, Panel } from "@repo/ui/components/states";
import { PlatformIcon } from "@repo/ui/components/social/platform";
import { PostArt } from "@repo/ui/components/social/post-art";
import { Button } from "@repo/ui/components/button";

export function UpcomingPosts({ clientId, posts, brand }: { clientId: string; posts: Post[]; brand: BrandKit }) {
  const upcoming = posts
    .filter((p) => p.status === "scheduled" && p.scheduledFor)
    .sort((a, b) => a.scheduledFor!.localeCompare(b.scheduledFor!))
    .slice(0, 8);

  return (
    <Panel aria-labelledby="upcoming-heading" className="overflow-hidden">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 id="upcoming-heading" className="type-heading">Going out next</h2>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/c/${clientId}/calendar`}><CalendarDays /> Open calendar</Link>
        </Button>
      </div>
      {upcoming.length === 0 ? (
        <EmptyState
          icon={<CalendarDays />}
          title="Nothing is scheduled"
          description="Approved posts land here with their publish time. Draft some content to fill the calendar."
          action={<Button asChild><Link href={`/c/${clientId}/content`}>Go to content</Link></Button>}
        />
      ) : (
        // Bleeds to the panel edge so it's obvious there is more to scroll.
        <ul className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:-mx-6 md:px-6">
          {upcoming.map((post) => (
            <li key={post.id} className="w-40 shrink-0 snap-start">
              <PostArt post={post} brand={brand} fixedAspect="aspect-[4/5]" />
              <p className="mt-2.5 flex items-center gap-1.5 text-[0.8125rem] font-medium">
                <PlatformIcon platform={post.platform} className="size-3.5 text-muted-foreground" />
                {format(new Date(post.scheduledFor!), "EEE d MMM")}
              </p>
              <p className="type-label tabular-nums">{format(new Date(post.scheduledFor!), "h:mm a")}</p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
