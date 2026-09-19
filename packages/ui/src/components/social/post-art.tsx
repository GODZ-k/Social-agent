import { Images, Play } from "lucide-react";
import type { BrandKit, Post } from "./types";
import { cn, readableOn } from "../../lib/utils";

const ASPECT: Record<Post["format"], string> = {
  image: "aspect-square",
  carousel: "aspect-[4/5]",
  reel: "aspect-[9/16]",
  story: "aspect-[9/16]",
};

/**
 * Stand-in artwork, composed from the client's own brand colours until the
 * agent returns real media. Type scales with the frame (container units), so
 * the same component works as a calendar chip or a full approval card.
 */
export function PostArt({
  post,
  brand,
  className,
  fixedAspect,
  style,
}: {
  post: Pick<Post, "hook" | "format" | "art" | "durationSec" | "mediaUrl">;
  brand: BrandKit;
  className?: string;
  /** Override the format's natural aspect ratio (e.g. square thumbnails). */
  fixedAspect?: string;
  style?: React.CSSProperties;
}) {
  const colors = brand.colors.length ? brand.colors : [{ name: "Primary", hex: "#4b3fe4" }];
  const bg = colors[post.art.colorIndex % colors.length]!.hex;
  const shape = colors[(post.art.colorIndex + 2) % colors.length]!.hex;
  const ink = readableOn(bg);

  return (
    <div
      className={cn("@container relative isolate overflow-hidden rounded-lg", fixedAspect ?? ASPECT[post.format], className)}
      style={{ ...style, background: bg, color: ink }}
    >
      {post.mediaUrl ? (
        // A real image is the creative: no generated shapes or headline on top of it.
        <img src={post.mediaUrl} alt={post.hook} draggable={false} className="absolute inset-0 size-full object-cover" />
      ) : (
        <>
      <Shapes variant={post.art.variant} color={shape} />
      <p
        className="absolute inset-x-[8cqw] bottom-[8cqw] font-display font-semibold"
        style={{ fontSize: "clamp(0.5rem, 9.5cqw, 2.6rem)", lineHeight: 1.04, letterSpacing: "-0.03em" }}
      >
        {post.hook}
      </p>
        </>
      )}
      {(post.format === "reel" || post.format === "carousel") && (
        <span
          className="absolute top-[6cqw] right-[6cqw] grid place-items-center rounded-full bg-black/25 text-white backdrop-blur-sm"
          style={{ width: "max(1.25rem, 13cqw)", height: "max(1.25rem, 13cqw)" }}
        >
          {post.format === "reel" ? (
            <Play className="size-[52%] translate-x-[6%] fill-current" strokeWidth={0} />
          ) : (
            <Images className="size-[52%]" />
          )}
        </span>
      )}
    </div>
  );
}

function Shapes({ variant, color }: { variant: number; color: string }) {
  const common = "absolute -z-10";
  switch (variant % 4) {
    case 0:
      return <span className={cn(common, "top-[-18%] right-[-22%] aspect-square w-[85%] rounded-full")} style={{ background: color }} />;
    case 1:
      return <span className={cn(common, "inset-x-0 top-0 h-[46%] origin-top-left -skew-y-12")} style={{ background: color }} />;
    case 2:
      return <span className={cn(common, "top-[10%] left-[14%] h-[52%] w-[72%] rounded-t-full")} style={{ background: color }} />;
    default:
      return (
        <span
          className={cn(common, "inset-0 opacity-70")}
          style={{
            backgroundImage: `radial-gradient(${color} 22%, transparent 23%)`,
            backgroundSize: "18cqw 18cqw",
            maskImage: "linear-gradient(to bottom, black 35%, transparent 70%)",
          }}
        />
      );
  }
}
