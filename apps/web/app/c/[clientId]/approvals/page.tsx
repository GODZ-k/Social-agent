"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useMotionValue } from "motion/react";
import { Check, Maximize2, PartyPopper, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { postsQuery, strategyQuery, useUpdatePost } from "@/lib/api/queries";
import { useWorkspace } from "@/hooks/use-workspace";
import { useMediaQuery } from "@repo/ui/hooks/use-media-query";
import { spring } from "@repo/ui/lib/motion";
import { EmptyState, ErrorState, PageHeader, Panel } from "@repo/ui/components/states";
import { SwipeCard, type Decision, type SwipeCardHandle } from "@repo/ui/components/social/swipe-card";
import { PostDetails } from "@repo/ui/components/social/post-details";
import { PostLightbox } from "@repo/ui/components/social/post-lightbox";
import { PostArt } from "@repo/ui/components/social/post-art";
import { PostSheet } from "@/components/post/post-sheet";
import { Button } from "@repo/ui/components/button";
import { Sheet } from "@repo/ui/components/sheet";

export default function ApprovalsPage() {
  const { clientId, client } = useWorkspace();
  const posts = useQuery(postsQuery(clientId));
  const { data: strategy } = useQuery(strategyQuery(clientId));
  const update = useUpdatePost(clientId);
  // Wide screens show the full post beside the card. Narrower ones open it in a sheet.
  const sideBySide = useMediaQuery("(min-width: 1024px)");

  const queue = useMemo(
    () =>
      (posts.data ?? [])
        .filter((p) => p.status === "in_review")
        .sort((a, b) => (a.scheduledFor ?? "").localeCompare(b.scheduledFor ?? "")),
    [posts.data],
  );

  // How many there were when the session started, so progress reads "2 of 5".
  const [sessionTotal, setSessionTotal] = useState(0);
  if (queue.length > sessionTotal) setSessionTotal(queue.length);
  const done = sessionTotal - queue.length;

  const top = queue[0];
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
    update.mutate({ postId, patch: { status: decision } });
    toast(decision === "approved" ? "Approved and scheduled" : "Rejected", {
      // Swipes are easy to get wrong, so every decision can be taken back.
      action: { label: "Undo", onClick: () => update.mutate({ postId, patch: { status: "in_review" } }) },
    });
  }

  /** Decide from anywhere (the sheet, the side panel): close what's open, then throw the card. */
  function decideTop(decision: Decision) {
    setReading(false);
    topCard.current?.decide(decision);
  }

  // Arrow keys mirror the swipe directions; E edits; Space reads the full post.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (editingId || reading || viewingImage || !top) return;
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, [contenteditable], [role='dialog']")) return;
      if (e.key === "ArrowRight") topCard.current?.decide("approved");
      else if (e.key === "ArrowLeft") topCard.current?.decide("rejected");
      else if (e.key.toLowerCase() === "e") setEditingId(top.id);
      // Space on a focused button belongs to that button.
      else if (e.key === " " && !target.closest("button, a")) {
        e.preventDefault();
        if (sideBySide) setViewingImage(true);
        else setReading(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editingId, reading, viewingImage, top, sideBySide]);

  const editing = posts.data?.find((p) => p.id === editingId) ?? null;

  return (
    <>
      <PageHeader
        title="Approvals"
        description="Read each post, then swipe right to approve or left to reject. Nothing is published without you."
      />

      {posts.isPending && <div className="skeleton mx-auto h-[clamp(22rem,calc(100dvh-26rem),40rem)] w-full max-w-[26rem] rounded-2xl lg:mx-0" />}
      {posts.error && <ErrorState error={posts.error} onRetry={() => posts.refetch()} />}

      {posts.data && client && (
        <AnimatePresence mode="wait" initial={false}>
          {queue.length === 0 || !top ? (
            <motion.div key="empty" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={spring.smooth}>
              <EmptyState
                icon={<PartyPopper />}
                title={done > 0 ? "That's all of them" : "Nothing to approve"}
                description={
                  done > 0
                    ? `You went through ${done} ${done === 1 ? "post" : "posts"}. Approved ones are on the calendar.`
                    : "New drafts from the agent will show up here before anything is scheduled."
                }
                action={<Button asChild><Link href={`/c/${clientId}/calendar`}>Open calendar</Link></Button>}
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
                    {queue.length} left{sessionTotal > queue.length ? ` of ${sessionTotal}` : ""}
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
                    {queue
                      .slice(0, 3)
                      .map((post, index) => (
                        <SwipeCard
                          key={post.id}
                          ref={index === 0 ? topCard : undefined}
                          post={post}
                          brand={client.brand}
                          index={index}
                          lead={lead}
                          onDecide={(d) => decide(post.id, d)}
                          onOpen={() => (sideBySide ? setViewingImage(true) : setReading(true))}
                        />
                      ))
                      .reverse()}
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <RoundAction label="Reject" tone="reject" onClick={() => decideTop("rejected")}><X strokeWidth={2.6} /></RoundAction>
                  <RoundAction label="Edit before deciding" tone="neutral" small onClick={() => setEditingId(top.id)}><Pencil /></RoundAction>
                  <RoundAction label="Approve" tone="approve" onClick={() => decideTop("approved")}><Check strokeWidth={2.6} /></RoundAction>
                </div>
                <p className="type-label mt-4 hidden text-center lg:block">Arrow keys decide, E edits, Space enlarges the image.</p>
              </div>

              {/* Wide screens: the whole post is readable without opening anything. */}
              <aside className="hidden lg:block" aria-label="Full post">
                <Panel>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={top.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={spring.snappy}
                    >
                      <PostDetails post={top} pillar={pillar} />
                      <div className="mt-6 flex flex-wrap gap-2.5">
                        <Button variant="secondary" onClick={() => setViewingImage(true)}><Maximize2 /> View image full size</Button>
                        <Button variant="secondary" onClick={() => setEditingId(top.id)}><Pencil /> Edit post</Button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </Panel>
              </aside>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Phones and tablets: the same details in a sheet, with the decision right there. */}
      {top && client && (
        <Sheet
          open={reading && !sideBySide}
          onOpenChange={setReading}
          title="Full post"
          description="Read it through, then decide."
          footer={
            <>
              <Button variant="outline" className="flex-1 text-destructive" onClick={() => decideTop("rejected")}>Reject</Button>
              <Button variant="secondary" className="flex-1" onClick={() => { setReading(false); setEditingId(top.id); }}>Edit</Button>
              <Button className="flex-1 bg-success text-white" onClick={() => decideTop("approved")}>Approve</Button>
            </>
          }
        >
          <div className="grid gap-5">
            <button
              type="button"
              onClick={() => setViewingImage(true)}
              aria-label="View the image at full size"
              className="pressable mx-auto w-full max-w-72 rounded-lg shadow-raised"
            >
              <PostArt post={top} brand={client.brand} />
            </button>
            <PostDetails post={top} pillar={pillar} />
          </div>
        </Sheet>
      )}

      {top && client && <PostLightbox post={top} brand={client.brand} open={viewingImage} onOpenChange={setViewingImage} />}

      <PostSheet post={editing} brand={client?.brand} clientId={clientId} onClose={() => setEditingId(null)} />
    </>
  );
}

function RoundAction({
  label,
  tone,
  small,
  onClick,
  children,
}: {
  label: string;
  tone: "approve" | "reject" | "neutral";
  small?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const tones = {
    approve: "bg-success text-white",
    reject: "bg-card text-destructive ring-1 ring-border",
    neutral: "bg-card text-muted-foreground ring-1 ring-border",
  };
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`pressable grid place-items-center rounded-full shadow-raised ${small ? "size-12 [&_svg]:size-4.5" : "size-16 [&_svg]:size-6"} ${tones[tone]}`}
    >
      {children}
    </button>
  );
}
