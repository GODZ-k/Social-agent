import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";

/** Shown on the "Needs approval" tab (S07): going through the queue one by one opens the review panel. */
export function ReviewBanner({ count, href }: { count: number; href: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-tint p-4">
      <p>
        <b className="font-semibold">{count} {count === 1 ? "post needs" : "posts need"} your decision.</b>{" "}
        <span className="text-muted-foreground">Going through them one by one is quickest: approve, and the next one opens.</span>
      </p>
      <Button asChild size="sm">
        <Link href={href} scroll={false}>
          Review one by one <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}
