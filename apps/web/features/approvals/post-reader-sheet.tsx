"use client";

import type { BrandKit } from "@social-agent/shared";
import type { Post } from "@/lib/types";
import { Button } from "@repo/ui/components/button";
import { Sheet } from "@repo/ui/components/sheet";
import { PostArt } from "@repo/ui/components/social/post-art";
import { PostDetails } from "@repo/ui/components/social/post-details";
import type { Decision } from "@repo/ui/components/social/swipe-card";

interface Props {
  post: Post;
  brand: BrandKit;
  pillar: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDecide: (decision: Decision) => void;
  onEdit: () => void;
  onViewImage: () => void;
}

/** Phones and tablets: the same details in a sheet, with the decision right there. */
export function PostReaderSheet({ post, brand, pillar, open, onOpenChange, onDecide, onEdit, onViewImage }: Props) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Full post"
      description="Read it through, then decide."
      footer={
        <>
          <Button variant="outline" className="flex-1 text-destructive" onClick={() => onDecide("rejected")}>Reject</Button>
          <Button variant="secondary" className="flex-1" onClick={onEdit}>Edit</Button>
          <Button className="flex-1 bg-success text-white" onClick={() => onDecide("approved")}>Approve</Button>
        </>
      }
    >
      <div className="grid gap-5">
        <button
          type="button"
          onClick={onViewImage}
          aria-label="View the image at full size"
          className="pressable mx-auto w-full max-w-72 rounded-lg shadow-raised"
        >
          <PostArt post={post} brand={brand} />
        </button>
        <PostDetails post={post} pillar={pillar} />
      </div>
    </Sheet>
  );
}
