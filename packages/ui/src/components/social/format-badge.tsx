import { CircleDashed, GalleryHorizontalEnd, Image as ImageIcon, Play, type LucideIcon } from "lucide-react";
import type { PostFormat } from "./types";
import { Badge } from "../badge";

/** What the owner calls each format. "Image post", not "Image": the image is the post. */
export const FORMAT_NAME: Record<PostFormat, string> = {
  image: "Image post",
  carousel: "Carousel",
  reel: "Reel",
  story: "Story",
};

export const FORMAT_ICON: Record<PostFormat, LucideIcon> = {
  image: ImageIcon,
  carousel: GalleryHorizontalEnd,
  reel: Play,
  story: CircleDashed,
};

export function FormatBadge({ format, className }: { format: PostFormat; className?: string }) {
  const Icon = FORMAT_ICON[format];
  return (
    <Badge variant="neutral" className={className}>
      <Icon aria-hidden />
      {FORMAT_NAME[format]}
    </Badge>
  );
}
