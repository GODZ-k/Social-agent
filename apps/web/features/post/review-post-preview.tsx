"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BrandKit } from "@social-agent/shared";
import type { PostView } from "@/lib/types";
import { PostArt } from "@repo/ui/components/social/post-art";
import { cn } from "@repo/ui/lib/utils";

/** The compact media stage inside the review sheet: one frame, stepped by slide for a carousel. */
export function ReviewPostPreview({ post, brand }: { post: PostView; brand: BrandKit }) {
  const slides = post.format === "carousel" ? Math.max(post.slides ?? 1, 1) : 1;
  const [index, setIndex] = useState(0);
  const current = index % slides;

  // There is one real image or headline per post, not per slide: only the generated seed varies.
  const artFor = (i: number) => ({ variant: post.art.variant + i, colorIndex: post.art.colorIndex + i });
  const framed = { ...post, art: artFor(current) };

  return (
    <div className="grid justify-items-center gap-2.5">
      {/* One height for every post; the width follows the format (square, 4:5, 9:16). */}
      <div className="relative h-72 max-w-full">
        <PostArt post={framed} brand={brand} className="h-full w-auto max-w-full" />
        {slides > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => setIndex((i) => (i - 1 + slides) % slides)}
              className="pressable absolute top-1/2 left-2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-foreground shadow-raised"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => setIndex((i) => (i + 1) % slides)}
              className="pressable absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-foreground shadow-raised"
            >
              <ChevronRight className="size-4" />
            </button>
            <span className="absolute top-2.5 left-2.5 rounded-full bg-black/60 px-2 py-0.5 text-[0.72rem] font-semibold text-white">
              {current + 1} / {slides}
            </span>
          </>
        )}
      </div>

      {slides > 1 && (
        <div className="flex gap-1.5" aria-label="Slides">
          {Array.from({ length: slides }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              aria-current={i === current}
              onClick={() => setIndex(i)}
              className={cn("size-10 shrink-0 overflow-hidden rounded-sm transition-opacity", i === current ? "opacity-100 ring-2 ring-primary" : "opacity-55")}
            >
              <PostArt post={{ ...post, art: artFor(i) }} brand={brand} fixedAspect="aspect-square" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
