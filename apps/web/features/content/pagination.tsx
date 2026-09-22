import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";

export function Pagination({ page, pages, total, onPrev, onNext }: { page: number; pages: number; total: number; onPrev?: () => void; onNext?: () => void }) {
  if (pages <= 1) return <p className="type-label mt-4 tabular-nums">{total} {total === 1 ? "post" : "posts"}</p>;
  return (
    <nav aria-label="Pages" className="mt-4 flex items-center justify-between gap-4">
      <p className="type-label tabular-nums">Page {page} of {pages}, {total} posts</p>
      <div className="flex gap-1.5">
        <Button variant="outline" size="icon-sm" onClick={onPrev} disabled={!onPrev} aria-label="Previous page"><ChevronLeft /></Button>
        <Button variant="outline" size="icon-sm" onClick={onNext} disabled={!onNext} aria-label="Next page"><ChevronRight /></Button>
      </div>
    </nav>
  );
}
