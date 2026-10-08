/** Types the content screens use and the API never sees. */

import type { Platform, PostFormat } from "@social-agent/shared";
import type { PostState } from "@/lib/types";

/** One post still coming: what it targets, shown as a real row while it drafts.
 * Mirrors `draftPost` in lib/api/mock/actions.ts so the preview matches the real post. */
export interface DraftingSlot {
  id: number;
  step: "Making the picture" | "Writing the caption" | "Next in line";
  platform: Platform;
  format: PostFormat;
  /** "5 slides" or "10 seconds", when the format carries one. */
  detail: string | null;
  scheduledFor: string;
}

export type StatusFilter = "" | PostState;
