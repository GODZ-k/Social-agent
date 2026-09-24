"use client";

import { useLayoutEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion, useMotionValue } from "motion/react";
import { Maximize2 } from "lucide-react";
import { toast } from "sonner";
import { updatePost } from "@/lib/api/actions";
import type { BrandKit } from "@social-agent/shared";
import type { Post, Strategy } from "@/lib/types";
import { LazyPostSheet } from "@/features/post/lazy-post-sheet";
import { useMediaQuery } from "@repo/ui/hooks/use-media-query";
import { spring } from "@repo/ui/lib/motion";
import { Button } from "@repo/ui/components/button";
import { SwipeCard, type Decision, type SwipeCardHandle } from "@repo/ui/components/social/swipe-card";
import { PostLightbox } from "@repo/ui/components/social/post-lightbox";
import { ApprovalActions } from "./approval-actions";
import { EmptyQueue } from "./empty-queue";
import { PostReaderSheet } from "./post-reader-sheet";
import { PostSidePanel } from "./post-side-panel";
import { useApprovalShortcuts } from "./use-approval-shortcuts";

interface Props {
  clientId: string;
  queue: Post[];
  brand: BrandKit;
  strategy: Strategy | null;
}

export function ApprovalStack({ clientId, queue, brand, strategy }: Props) {
  // Wide screens show the full post beside the card. Narrower ones open it in a sheet.
  const sideBySide = useMediaQuery("(min-width: 1024px)");

  // The card leaves the moment it is swiped; the revalidated route catches up when the action resolves.
  const [visibleQueue, removeOptimistically] = useOptimistic(queue, (state, postId: string) =>
    state.filter((p) => p.id !== postId),
  );
  const [, startTransition] = useTransition();

  // How many there were when the session started, so progress reads "2 of 5".
  const [sessionTotal, setSessionTotal] = useState(0);
  if (visibleQueue.length > sessionTotal) setSessionTotal(visibleQueue.length);
  const done = sessionTotal - visibleQueue.length;

  const top = visibleQueue[0];
  const topCard = useRef<SwipeCardHandle>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [viewingImage, setViewingImage] = useState(false);
  const pillar = strategy?.pillars.find((p) => p.id === top?.pillarId)?.name;

  // Shared with every card so the ones beneath can rise as the top one leaves.
  const lead = useMotionValue(0);
  useLayoutEffect(() => {
    lead.set(0);
  }, [top?.id, lead]);

  function decide(postId: string, decision: Decision) {
    startTransition(async () => {
      removeOptimistically(postId);
      const result = await updatePost(postId, { status: decision });
      if (!result.ok) {
        toast.error(`Couldn't save that change. ${result.message}`);
        return;
      }
      toast(decision === "approved" ? "Approved and scheduled" : "Rejected", {
        // Swipes are easy to get wrong, so every decision can be taken back.
        action: {
          label: "Undo",
          onClick: () =>
            startTransition(async () => {
              await updatePost(postId, { status: "in_review" });
            }),
        },
      });
    });
  }

  /** Decide from anywhere (the sheet, the side panel): close what's open, then throw the card. */
  function decideTop(decision: Decision) {
    setReading(false);
    topCard.current?.decide(decision);
  }

  function editTop() {
    if (top) setEditingId(top.id);
  }

  function openTop() {
    if (sideBySide) setViewingImage(true);
    else setReading(true);
  }

  useApprovalShortcuts({
    enabled: !editingId && !reading && !viewingImage && !!top,
    onApprove: () => topCard.current?.decide("approved"),
    onReject: () => topCard.current?.decide("rejected"),
    onEdit: editTop,
    onRead: openTop,
  });

  const editing = queue.find((p) => p.id === editingId) ?? null;

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        {!top ? (
          <motion.div key="empty" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={spring.smooth}>
            <EmptyQueue clientId={clientId} done={done} />
          </motion.div>
        ) : (
          <motion.div
            key="stack"
            exit={{ opacity: 0 }}
            className="grid items-start gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]"
          >
            <div className="mx-auto flex w-full max-w-[26rem] flex-col items-center lg:mx-0">
              <div className="mb-3 flex w-full items-center justify-between gap-3">
                <p className="type-label tabular-nums" aria-live="polite">
                  {visibleQueue.length} left{sessionTotal > visibleQueue.length ? ` of ${sessionTotal}` : ""}
                </p>
                {/* Sits above the card so it never competes with the tab bar for space. */}
                <Button variant="ghost" size="sm" className="-mr-2 lg:hidden" onClick={() => setReading(true)}>
                  <Maximize2 /> Read the full post
                </Button>
              </div>

              {/*
                Sized from the viewport so the action buttons always clear the tab bar,
                and tall enough that the image, not the text, is most of the card.
                Bottom padding leaves room for the cards peeking out beneath.
              */}
              <div className="relative h-[clamp(22rem,calc(100dvh-26rem),40rem)] w-full pb-8">
                <div className="relative size-full">
                  {visibleQueue
                    .slice(0, 3)
                    .map((post, index) => (
                      <SwipeCard
                        key={post.id}
                        ref={index === 0 ? topCard : undefined}
                        post={post}
                        brand={brand}
                        index={index}
                        lead={lead}
                        onDecide={(d) => decide(post.id, d)}
                        onOpen={openTop}
                      />
                    ))
                    .reverse()}
                </div>
              </div>

              <ApprovalActions onReject={() => decideTop("rejected")} onEdit={editTop} onApprove={() => decideTop("approved")} />
            </div>

            <PostSidePanel post={top} pillar={pillar} onViewImage={() => setViewingImage(true)} onEdit={editTop} />
          </motion.div>
        )}
      </AnimatePresence>

      {top && (
        <PostReaderSheet
          post={top}
          brand={brand}
          pillar={pillar}
          open={reading && !sideBySide}
          onOpenChange={setReading}
          onDecide={decideTop}
          onEdit={() => {
            setReading(false);
            editTop();
          }}
          onViewImage={() => setViewingImage(true)}
        />
      )}

      {top && <PostLightbox post={top} brand={brand} open={viewingImage} onOpenChange={setViewingImage} />}

      <LazyPostSheet post={editing} brand={brand} strategy={strategy} onClose={() => setEditingId(null)} />
    </>
  );
}
