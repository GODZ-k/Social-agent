import type { ComponentProps } from "react";
import type { LoopTrack } from "@repo/ui/components/social/loop-track";
import type { PostArt } from "@repo/ui/components/social/post-art";
import type { SwipeCard } from "@repo/ui/components/social/swipe-card";

// The design system exports components, not its type file. Reading the shapes
// off the components' props keeps the example data checked against exactly
// what those components accept.
export type BrandKit = ComponentProps<typeof PostArt>["brand"];
export type Post = ComponentProps<typeof SwipeCard>["post"];
export type LoopStage = ComponentProps<typeof LoopTrack>["stage"];
