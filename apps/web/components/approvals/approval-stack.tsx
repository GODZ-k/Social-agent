"use client";

import {
  useLayoutEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { AnimatePresence, motion, useMotionValue } from "motion/react";
import { ArrowLeft, ArrowRight, Layers } from "lucide-react";
import { toast } from "sonner";
import {
  approvePost,
  askForPostChanges,
  rejectPost,
  setRejectReason,
  undoPostDecision,
} from "@/lib/api/actions";
import type { BrandKit, Platform } from "@social-agent/shared";
import type { PostView, SocialAccountRow, Strategy } from "@/lib/types";
import type { WorkspaceBasePath } from "@/lib/workspace-path";
import { spring } from "@repo/ui/lib/motion";
import { Button } from "@repo/ui/components/button";
import { PLATFORM_LABEL } from "@repo/ui/components/social/platform";
import {
  SwipeCard,
  type Decision,
  type SwipeCardHandle,
} from "@repo/ui/components/social/swipe-card";
import { AskForChangesDialog } from "@/components/post/ask-for-changes-dialog";
import { PostViewer } from "@/components/viewer/post-viewer";
import { ApprovalActions } from "./approval-actions";
import { EmptyQueue } from "./empty-queue";
import { PostSidePanel } from "./post-side-panel";
import { RejectToast } from "./reject-toast";
import { useApprovalShortcuts } from "@/hooks/use-approval-shortcuts";

interface Props {
  brandId: string;
  queue: PostView[];
  brand: BrandKit;
  strategy: Strategy | null;
  accounts: SocialAccountRow[];
  basePath?: WorkspaceBasePath;
}

export function ApprovalStack({
  brandId,
  queue,
  brand,
  strategy,
  accounts,
  basePath = "/c",
}: Props) {
  // The card leaves the moment it is swiped; the revalidated route catches up when the action resolves.
  const [visibleQueue, removeOptimistically] = useOptimistic(
    queue,
    (state, postId: string) => state.filter((p) => p.id !== postId),
  );
  const [, startTransition] = useTransition();

  // How many there were when the session started, so progress reads "2 of 5".
  const [sessionTotal, setSessionTotal] = useState(0);
  if (visibleQueue.length > sessionTotal) setSessionTotal(visibleQueue.length);
  const done = sessionTotal - visibleQueue.length;

  // What each decision turned into, for the empty queue's "what happens next" (ST-4). Like
  // `sessionTotal`, this is session-only bookkeeping and isn't reconciled if a decision is undone.
  const [decided, setDecided] = useState<{
    approved: PostView[];
    changes: number;
  }>({ approved: [], changes: 0 });

  const top = visibleQueue[0];
  const topCard = useRef<SwipeCardHandle>(null);
  const [asking, setAsking] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const pillar = strategy?.pillars.find((p) => p.id === top?.pillarId)?.name;

  // Shared with every card so the ones beneath can rise as the top one leaves.
  const lead = useMotionValue(0);
  useLayoutEffect(() => {
    lead.set(0);
  }, [top?.id, lead]);

  function isConnected(platform: Platform) {
    return accounts.find((a) => a.platform === platform)?.state === "connected";
  }

  function undo(postId: string) {
    startTransition(async () => {
      await undoPostDecision(postId);
    });
  }

  function decide(postId: string, decision: Decision) {
    startTransition(async () => {
      removeOptimistically(postId);
      const result =
        decision === "approved"
          ? await approvePost(postId)
          : await rejectPost(postId);
      if (!result.ok) {
        toast.error(`Couldn't save that. ${result.message}`);
        return;
      }
      if (decision === "approved") {
        setDecided((d) => ({
          ...d,
          approved: [...d.approved, result.data.post],
        }));
        const waits = result.data.post.state === "waiting_for_connection";
        toast(
          waits
            ? `Approved. It waits for ${PLATFORM_LABEL[result.data.post.platform]}.`
            : "Approved and scheduled.",
          {
            action: { label: "Undo", onClick: () => undo(postId) },
          },
        );
      } else {
        toast.custom(() => (
          <RejectToast
            onUndo={() => undo(postId)}
            onReason={(reason) =>
              startTransition(async () => {
                await setRejectReason(postId, reason);
              })
            }
          />
        ));
      }
    });
  }

  function sendChanges(postId: string, note: string) {
    startTransition(async () => {
      removeOptimistically(postId);
      const result = await askForPostChanges(postId, note);
      setAsking(false);
      if (!result.ok) {
        toast.error(`Couldn't send that. ${result.message}`);
        return;
      }
      setDecided((d) => ({ ...d, changes: d.changes + 1 }));
      toast("Sent to the agent. It comes back for another look.", {
        action: { label: "Undo", onClick: () => undo(postId) },
      });
    });
  }

  /** Decide from anywhere (the viewer, the side panel): throw the card. */
  function decideTop(decision: Decision) {
    topCard.current?.decide(decision);
  }

  function askTop() {
    if (top) setAsking(true);
  }

  function openTop() {
    if (top) setViewerIndex(0);
  }

  useApprovalShortcuts({
    enabled: !asking && viewerIndex === null && !!top,
    onApprove: () => topCard.current?.decide("approved"),
    onReject: () => topCard.current?.decide("rejected"),
    onAsk: askTop,
    onRead: openTop,
  });

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        {!top ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring.smooth}
          >
            <EmptyQueue
              brandId={brandId}
              done={done}
              approved={decided.approved}
              changesCount={decided.changes}
              basePath={basePath}
            />
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
                  {visibleQueue.length} left of {sessionTotal}
                </p>
                {/* Sits above the card so it never competes with the tab bar for space. */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="-mr-2 lg:hidden"
                  onClick={openTop}
                >
                  <Layers /> Read the full post
                </Button>
              </div>

              {/*
                Sized from the viewport so the action buttons always clear the tab bar,
                and tall enough that the image, not the text, is most of the card.
                Bottom padding leaves room for the cards peeking out beneath.
              */}
              <div className="relative h-[clamp(20rem,calc(100dvh-27rem),36rem)] w-full pb-8 lg:h-[clamp(22rem,calc(100dvh-26rem),40rem)]">
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

              {/* mt-8 clears the floating shadow the peeking back cards cast into the pb-8 gap above. */}
              <p className="type-label mt-8 flex w-full items-center justify-between">
                <span className="inline-flex items-center gap-1.5">
                  <ArrowLeft className="size-3.5" /> Swipe left to reject
                </span>
                <span className="inline-flex items-center gap-1.5">
                  Swipe right to approve <ArrowRight className="size-3.5" />
                </span>
              </p>

              <ApprovalActions
                onReject={() => decideTop("rejected")}
                onAsk={askTop}
                onApprove={() => decideTop("approved")}
              />
              
            </div>

            <PostSidePanel
              post={top}
              pillar={pillar}
              strategy={strategy}
              connected={isConnected(top.platform)}
              editHref={`?post=${top.id}`}
              onViewSlides={() => setViewerIndex(0)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {viewerIndex !== null && visibleQueue.length > 0 && (
        <PostViewer
          queue={visibleQueue}
          index={Math.min(viewerIndex, visibleQueue.length - 1)}
          brand={brand}
          strategy={strategy}
          isConnected={isConnected}
          onIndexChange={setViewerIndex}
          onClose={() => setViewerIndex(null)}
          onApprove={(postId) => decide(postId, "approved")}
          onReject={(postId) => decide(postId, "rejected")}
          onAskForChanges={sendChanges}
        />
      )}

      <AskForChangesDialog
        open={asking}
        onOpenChange={setAsking}
        onSend={(note) => top && sendChanges(top.id, note)}
      />
     
    </>
  );
}
