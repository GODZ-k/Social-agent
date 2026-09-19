/**
 * The shapes the social components need, and nothing more.
 *
 * These are deliberately structural minimums, not the app's data model: an app
 * passes its own, richer `Post` or `Client` and TypeScript checks it fits. That
 * keeps this package free of any one app's API while still catching drift at
 * the call site.
 */
export type Platform = "instagram" | "facebook" | "linkedin" | "tiktok";
export type PostFormat = "image" | "carousel" | "reel" | "story";
export type PostStatus = "draft" | "in_review" | "approved" | "scheduled" | "published" | "rejected";
export type LoopStage = "onboarding" | "strategy" | "content" | "approval" | "publishing" | "learning";

export interface BrandColor {
  name: string;
  hex: string;
}

/** Only the palette is needed to draw in a brand's colours. */
export interface BrandKit {
  colors: BrandColor[];
}

export interface Post {
  platform: Platform;
  format: PostFormat;
  /** Short on-image headline. */
  hook: string;
  caption: string;
  hashtags: string[];
  scheduledFor: string | null;
  /** A real image, when the post has one. Otherwise artwork is drawn from the brand colours. */
  mediaUrl?: string | null;
  /** Procedural artwork seed: layout variant + index into the brand colours. */
  art: { variant: number; colorIndex: number };
  durationSec?: number;
  /** Why the agent made this post. */
  aiNote: string;
}

export interface Client {
  name: string;
  /** Primary brand colour. */
  accent: string;
}
