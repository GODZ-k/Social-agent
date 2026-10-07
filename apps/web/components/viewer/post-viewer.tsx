"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { motion, useReducedMotion, type PanInfo } from "motion/react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { BrandKit, Platform } from "@social-agent/shared";
import type { PostView, Strategy } from "@/lib/types";
import { LightboxFullscreen } from "@repo/ui/components/lightbox";
import { PostFacts } from "@repo/ui/components/social/post-facts";
import { AskForChangesDialog } from "@/components/post/ask-for-changes-dialog";
import { ViewerDetails } from "./viewer-details";
import { ViewerStage } from "./viewer-stage";

interface Props {
  queue: PostView[];
  index: number;
  brand: BrandKit;
  strategy: Strategy | null;
  isConnected: (platform: Platform) => boolean;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  onApprove: (postId: string) => void;
  onReject: (postId: string) => void;
  onAskForChanges: (postId: string, note: string) => void;
}

/** The full-screen viewer (S10). Every "See all slides full size" and Space open this. */
export function PostViewer({ queue, index, brand, strategy, isConnected, onIndexChange, onClose, onApprove, onReject, onAskForChanges }: Props) {
  const post = queue[Math.min(index, queue.length - 1)];
  const [slide, setSlide] = useState(0);
  const [asking, setAsking] = useState(false);
  const reduceMotion = useReducedMotion();
  const slides = post?.format === "carousel" ? Math.max(post.slides ?? 1, 1) : 1;

  // Land on the first slide of whichever post this is, without an effect.
  const [shownPostId, setShownPostId] = useState(post?.id);
  if (post?.id !== shownPostId) {
    setShownPostId(post?.id);
    setSlide(0);
  }

  useEffect(() => {
    if (queue.length === 0) onClose();
  }, [queue.length, onClose]);

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (!post) return;
    const target = e.target as HTMLElement;
    if (target.closest("input, textarea, [contenteditable]")) return;
    if (e.key === "ArrowLeft") setSlide((s) => (s - 1 + slides) % slides);
    else if (e.key === "ArrowRight") setSlide((s) => (s + 1) % slides);
    else if (e.key === "ArrowUp" && index > 0) onIndexChange(index - 1);
    else if (e.key === "ArrowDown" && index < queue.length - 1) onIndexChange(index + 1);
    else if (e.key.toLowerCase() === "a") onApprove(post.id);
    else if (e.key.toLowerCase() === "r") onReject(post.id);
    else if (e.key.toLowerCase() === "e") setAsking(true);
  });

  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  if (!post) return null;

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (Math.abs(info.offset.y) > Math.abs(info.offset.x) && info.offset.y > 120) {
      onClose();
    } else if (slides > 1 && Math.abs(info.offset.x) > 70) {
      setSlide((s) => (info.offset.x < 0 ? (s + 1) % slides : (s - 1 + slides) % slides));
    }
  }

  const when = post.scheduledFor ? format(new Date(post.scheduledFor), "EEEE d MMMM, h:mm a") : "No time set";

  return (
    <LightboxFullscreen open onOpenChange={(next) => !next && onClose()} title={`${post.hook}, full size`}>
      <div className="flex h-full flex-col overflow-hidden bg-[#0c0f16]/95 text-white backdrop-blur-lg lg:grid lg:grid-cols-[1fr_24rem] lg:grid-rows-[auto_1fr]">
        <header className="flex flex-wrap items-center gap-3 px-4 pt-3.5 pb-2 sm:px-6 lg:col-start-1 lg:row-start-1">
          <button
            type="button"
            aria-label="Close, back to approvals"
            onClick={onClose}
            className="pressable grid size-10 shrink-0 place-items-center rounded-full bg-white/15 hover:bg-white/25"
          >
            <X className="size-4.5" />
          </button>
          <div className="order-3 grid min-w-0 basis-full gap-1.5 sm:order-none sm:basis-auto">
            <h2 className="truncate font-display text-[1.0625rem] font-semibold tracking-tight sm:text-xl">{post.hook}</h2>
            <PostFacts
              platform={post.platform}
              format={post.format}
              slides={post.slides}
              durationSec={post.durationSec}
              date={when}
              tone="dark"
              size="sm"
            />
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1 text-[0.8125rem] text-white/70">
            <button
              type="button"
              aria-label="Previous post"
              disabled={index === 0}
              onClick={() => onIndexChange(index - 1)}
              className="pressable grid size-8 place-items-center rounded-full bg-white/10 disabled:opacity-30 max-[560px]:hidden"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="tabular-nums">
              Post {index + 1} of {queue.length}
            </span>
            <button
              type="button"
              aria-label="Next post"
              disabled={index === queue.length - 1}
              onClick={() => onIndexChange(index + 1)}
              className="pressable grid size-8 place-items-center rounded-full bg-white/10 disabled:opacity-30 max-[560px]:hidden"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </header>

        <motion.div
          drag
          onDragEnd={handleDragEnd}
          dragElastic={0.5}
          dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
          dragMomentum={false}
          className="relative flex min-h-64 flex-1 touch-none items-center justify-center overflow-hidden p-4 lg:col-start-1 lg:row-start-2"
        >
          <ViewerStage post={post} brand={brand} slide={slide} slides={slides} onSlide={setSlide} reduceMotion={!!reduceMotion} />
        </motion.div>

        <p className="pb-2 text-center text-[0.8125rem] text-white/50 lg:hidden">Swipe down to close.</p>

        {/* The decision panel: a light card on the dark stage, so the post reads as the
            post and the panel as the tool. A bottom dock below `lg`, a full-height side column at it. */}
        <aside className="min-h-0 shrink-0 overflow-hidden rounded-t-2xl border-t border-white/10 bg-card text-foreground lg:col-start-2 lg:row-span-2 lg:m-3 lg:rounded-[1.75rem] lg:border-t-0">
          <ViewerDetails
            post={post}
            strategy={strategy}
            connected={isConnected(post.platform)}
            onApprove={() => onApprove(post.id)}
            onReject={() => onReject(post.id)}
            onAsk={() => setAsking(true)}
          />
        </aside>
      </div>

      <AskForChangesDialog
        open={asking}
        onOpenChange={setAsking}
        onSend={(note) => {
          setAsking(false);
          onAskForChanges(post.id, note);
        }}
        initialText={post.format === "carousel" ? `Slide ${slide + 1}: ` : ""}
      />
    </LightboxFullscreen>
  );
}
