"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "motion/react";
import { format } from "date-fns";
import { Check, Sparkles, X } from "lucide-react";
import type { BrandKit, Post } from "@/lib/types";
import { project, spring } from "@/lib/motion";
import { FORMAT_LABEL, PLATFORM_LABEL, PlatformIcon } from "@/components/post/platform";
import { PostArt } from "@/components/post/post-art";

export type Decision = "approved" | "rejected";
export interface SwipeCardHandle {
  /** Play the same throw a swipe would, for the buttons and keyboard. */
  decide: (decision: Decision) => void;
}

/** How far a card must be heading before a release counts as a decision. */
const COMMIT_DISTANCE = 140;
/** Resting scale and offset for each depth in the stack. */
const DEPTH = [
  { scale: 1, y: 0 },
  { scale: 0.94, y: 16 },
  { scale: 0.88, y: 32 },
];

interface Props {
  post: Post;
  brand: BrandKit;
  /** 0 is the top card. */
  index: number;
  /** The top card's horizontal position, shared so the cards beneath can respond to it. */
  lead: MotionValue<number>;
  onDecide: (decision: Decision) => void;
}

export const SwipeCard = forwardRef<SwipeCardHandle, Props>(function SwipeCard(
  { post, brand, index, lead, onDecide },
  ref,
) {
  const isTop = index === 0;
  const x = useMotionValue(0);
  const leaving = useRef(false);

  // Read during transforms, so a card that moves up the stack recomputes from its new depth.
  const depth = useRef(index);
  depth.current = index;

  useMotionValueEvent(x, "change", (v) => {
    if (depth.current === 0) lead.set(v);
  });

  // The card tilts around a point below it, like something held at the bottom edge.
  const rotate = useTransform(x, [-320, 0, 320], [-14, 0, 14]);
  const approve = useTransform(x, [24, COMMIT_DISTANCE], [0, 1]);
  const reject = useTransform(x, [-COMMIT_DISTANCE, -24], [1, 0]);

  // Cards beneath rise toward the next depth as the top card leaves: the
  // in-between frames show what will happen if you let go.
  const progress = (v: number) => Math.min(Math.abs(v) / (COMMIT_DISTANCE * 1.6), 1);
  const mix = (key: "scale" | "y") => (v: number) => {
    const here = DEPTH[Math.min(depth.current, 2)]!;
    const next = DEPTH[Math.max(Math.min(depth.current, 2) - 1, 0)]!;
    return here[key] + (next[key] - here[key]) * progress(v);
  };
  const scale = useTransform(lead, mix("scale"));
  const y = useTransform(lead, mix("y"));

  function throwOut(decision: Decision, velocity = 0) {
    if (leaving.current) return;
    leaving.current = true;
    const direction = decision === "approved" ? 1 : -1;
    // The commit is the causal moment, so the haptic fires here, not when the animation ends.
    navigator.vibrate?.(decision === "approved" ? 12 : [8, 40, 8]);
    animate(x, direction * (window.innerWidth + 200), {
      type: "spring",
      bounce: 0,
      duration: 0.5,
      // Keep the finger's speed, with a floor so a button press still reads as a throw.
      velocity: direction * Math.max(Math.abs(velocity), 900),
    });
    // Hand over as soon as the card has cleared the stack rather than when the spring settles.
    window.setTimeout(() => onDecide(decision), 220);
  }

  useImperativeHandle(ref, () => ({ decide: (d) => throwOut(d) }));

  function handleDragEnd(_: unknown, info: PanInfo) {
    const vx = info.velocity.x;
    // Decide from where the flick is heading, not where the finger happened to lift.
    const resting = x.get() + project(vx);
    const heading = Math.sign(resting);
    const opposed = vx !== 0 && Math.sign(vx) !== heading && Math.abs(vx) > 200;
    if (Math.abs(resting) > COMMIT_DISTANCE && !opposed) {
      throwOut(heading > 0 ? "approved" : "rejected", vx);
    } else {
      // Settle home carrying the release velocity, so there is no seam between drag and spring.
      animate(x, 0, { ...spring.momentum, velocity: vx });
    }
  }

  return (
    <motion.article
      aria-hidden={!isTop}
      aria-label={isTop ? `${post.hook}. ${PLATFORM_LABEL[post.platform]} ${FORMAT_LABEL[post.format]}` : undefined}
      className="absolute inset-0 flex touch-pan-y flex-col overflow-hidden rounded-2xl bg-card shadow-floating select-none"
      style={{
        x,
        rotate,
        scale: isTop ? 1 : scale,
        y: isTop ? 0 : y,
        zIndex: 10 - index,
        transformOrigin: "50% 120%",
        cursor: isTop ? "grab" : "default",
      }}
      drag={isTop ? "x" : false}
      dragMomentum={false}
      whileDrag={{ cursor: "grabbing" }}
      onDragEnd={handleDragEnd}
    >
      <div className="relative min-h-0 flex-1 bg-secondary">
        <PostArt post={post} brand={brand} fixedAspect="h-full" className="rounded-none" />
        <Stamp opacity={approve} side="left" tone="approve"><Check strokeWidth={3} /> Approve</Stamp>
        <Stamp opacity={reject} side="right" tone="reject"><X strokeWidth={3} /> Reject</Stamp>
      </div>

      <div className="grid shrink-0 gap-2.5 p-5">
        <p className="type-label flex flex-wrap items-center gap-x-2 gap-y-1">
          <PlatformIcon platform={post.platform} className="size-3.5" />
          <span>{PLATFORM_LABEL[post.platform]} {FORMAT_LABEL[post.format].toLowerCase()}</span>
          {post.scheduledFor && <span className="ml-auto tabular-nums">{format(new Date(post.scheduledFor), "EEE d MMM, h:mm a")}</span>}
        </p>
        <p className="line-clamp-3 text-[0.9375rem] leading-snug">{post.caption}</p>
        <p className="flex gap-2 rounded-md bg-tint px-3 py-2.5 text-[0.8125rem] leading-snug text-tint-foreground">
          <Sparkles className="mt-0.5 size-3.5 shrink-0" />
          <span className="line-clamp-2">{post.aiNote}</span>
        </p>
      </div>
    </motion.article>
  );
});

function Stamp({
  opacity,
  side,
  tone,
  children,
}: {
  opacity: MotionValue<number>;
  side: "left" | "right";
  tone: "approve" | "reject";
  children: React.ReactNode;
}) {
  return (
    <motion.span
      aria-hidden
      style={{ opacity }}
      className={`absolute top-5 ${side === "left" ? "left-5 -rotate-6" : "right-5 rotate-6"} flex items-center gap-1.5 rounded-full px-4 py-2 font-display text-lg font-semibold text-white shadow-floating [&_svg]:size-5 ${tone === "approve" ? "bg-success" : "bg-destructive"}`}
    >
      {children}
    </motion.span>
  );
}
