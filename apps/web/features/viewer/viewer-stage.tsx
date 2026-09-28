"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import type { BrandKit } from "@social-agent/shared";
import type { PostView } from "@/lib/types";
import { PostArt } from "@repo/ui/components/social/post-art";

interface Props {
  post: PostView;
  brand: BrandKit;
  slide: number;
  slides: number;
  onSlide: (index: number) => void;
  reduceMotion: boolean;
}

/** The media itself: a real video for a reel with media, generated artwork otherwise. */
export function ViewerStage({ post, brand, slide, slides, onSlide, reduceMotion }: Props) {
  const [muted, setMuted] = useState(true);
  // There is one real image or headline per post, not per slide: only the generated seed varies.
  const framed = { ...post, art: { variant: post.art.variant + slide, colorIndex: post.art.colorIndex + slide } };

  if (post.format === "reel" && post.mediaUrl) {
    return (
      <div className="relative aspect-9/16 max-h-full">
        <video
          src={post.mediaUrl}
          className="size-full rounded-lg object-cover"
          autoPlay={!reduceMotion}
          muted={muted}
          loop
          playsInline
          controls={reduceMotion}
        />
        {!reduceMotion && (
          <button
            type="button"
            aria-label={muted ? "Turn sound on" : "Turn sound off"}
            onClick={() => setMuted((m) => !m)}
            className="pressable absolute right-3 bottom-3 grid size-9 place-items-center rounded-full bg-black/50 text-white"
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative max-h-full" style={{ width: "min(100%, 30rem)" }}>
      <PostArt post={framed} brand={brand} className="max-h-[65dvh]" />
      {slides > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => onSlide((slide - 1 + slides) % slides)}
            className="pressable absolute top-1/2 left-2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-foreground shadow-raised"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => onSlide((slide + 1) % slides)}
            className="pressable absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-foreground shadow-raised"
          >
            <ChevronRight className="size-4" />
          </button>
          <span className="absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
            {slide + 1} / {slides}
          </span>
        </>
      )}
    </div>
  );
}
