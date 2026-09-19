import type { Platform, PostFormat, PostStatus } from "./types";
import { Badge } from "../badge";
import { cn } from "../../lib/utils";

export const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
};

export const FORMAT_LABEL: Record<PostFormat, string> = {
  image: "Image",
  carousel: "Carousel",
  reel: "Reel",
  story: "Story",
};

const glyphs: Record<Platform, React.ReactNode> = {
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: (
    <path d="M14.2 8.2h2.3V4.6h-2.6a3.9 3.9 0 0 0-3.9 3.9V11H7.6v3.5H10V20.5h3.6v-6h2.5l.5-3.5h-3V8.8c0-.4.2-.6.6-.6Z" />
  ),
  linkedin: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
      <path d="M8 10.6v5.9M8 7.6v.1M12 16.5v-5.9m0 2.6a2.4 2.4 0 0 1 4.8 0v3.3" />
    </>
  ),
  tiktok: <path d="M13.8 4v10.6a3.4 3.4 0 1 1-3.4-3.4M13.8 4c.3 2.5 2 4.1 4.6 4.4" />,
};

export function PlatformIcon({ platform, className }: { platform: Platform; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4 shrink-0", className)}
      role="img"
      aria-label={PLATFORM_LABEL[platform]}
    >
      {glyphs[platform]}
    </svg>
  );
}

const STATUS: Record<PostStatus, { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }> = {
  draft: { label: "Draft", variant: "neutral" },
  in_review: { label: "Needs approval", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  scheduled: { label: "Scheduled", variant: "tint" },
  published: { label: "Published", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
};

export const STATUS_LABEL = Object.fromEntries(
  Object.entries(STATUS).map(([k, v]) => [k, v.label]),
) as Record<PostStatus, string>;

export function StatusBadge({ status }: { status: PostStatus }) {
  const { label, variant } = STATUS[status];
  return <Badge variant={variant}>{label}</Badge>;
}
