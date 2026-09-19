"use client";

import { Lightbox } from "../lightbox";
import { PostArt } from "./post-art";
import type { BrandKit, Post } from "./types";

/** Width-to-height of each format, so the image can be as large as the screen allows without distorting. */
const RATIO: Record<Post["format"], number> = { image: 1, carousel: 4 / 5, reel: 9 / 16, story: 9 / 16 };

/** A post's image at the largest size that fits the screen. */
export function PostLightbox({
  post,
  brand,
  open,
  onOpenChange,
}: {
  post: Pick<Post, "hook" | "format" | "art" | "durationSec" | "mediaUrl">;
  brand: BrandKit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Lightbox open={open} onOpenChange={onOpenChange} title={`${post.hook}, full size`}>
      <PostArt
        post={post}
        brand={brand}
        className="shadow-floating"
        // As wide as the screen allows, but never so wide that its height would overflow.
        style={{ width: `min(100%, 40rem, calc(84dvh * ${RATIO[post.format]}))` }}
      />
    </Lightbox>
  );
}
