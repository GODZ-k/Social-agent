"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useMotionValue } from "motion/react";
import { Check, PartyPopper, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { postsQuery, useUpdatePost } from "@/lib/api/queries";
import { useWorkspace } from "@/hooks/use-workspace";
import { spring } from "@/lib/motion";
import { EmptyState, ErrorState, PageHeader } from "@/components/shell/states";
import { SwipeCard, type Decision, type SwipeCardHandle } from "@/components/approvals/swipe-card";
import { PostSheet } from "@/components/post/post-sheet";
import { Button } from "@/components/ui/button";

export default function ApprovalsPage() {
  const { clientId, client } = useWorkspace();
  const posts = useQuery(postsQuery(clientId));
  const update = useUpdatePost(clientId);

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

  // Arrow keys mirror the swipe directions; E opens the editor.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (editingId || !top) return;
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, [contenteditable], [role='dialog']")) return;
      if (e.key === "ArrowRight") topCard.current?.decide("approved");
      else if (e.key === "ArrowLeft") topCard.current?.decide("rejected");
      else if (e.key.toLowerCase() === "e") setEditingId(top.id);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editingId, top]);

  const editing = posts.data?.find((p) => p.id === editingId) ?? null;

  return (
    <>
      <PageHeader
        title="Approvals"
        description="Swipe right to approve, left to reject. Nothing is published without you."
      />

      {posts.isPending && <div className="skeleton mx-auto aspect-[3/4.4] w-full max-w-sm rounded-2xl" />}
      {posts.error && <ErrorState error={posts.error} onRetry={() => posts.refetch()} />}

      {posts.data && client && (
        <AnimatePresence mode="wait" initial={false}>
          {queue.length === 0 ? (
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
            <motion.div key="stack" exit={{ opacity: 0 }} className="mx-auto flex w-full max-w-sm flex-col items-center">
              <p className="type-label mb-4 tabular-nums" aria-live="polite">
                {queue.length} left{sessionTotal > queue.length ? ` of ${sessionTotal}` : ""}
              </p>

              {/*
                Sized from the viewport, not an aspect ratio, so the action buttons always
                clear the tab bar. Bottom padding leaves room for the cards peeking out beneath.
              */}
              <div className="relative h-[clamp(20rem,calc(100dvh-26rem),34rem)] w-full pb-8">
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
                      />
                    ))
                    .reverse()}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <RoundAction label="Reject" tone="reject" onClick={() => topCard.current?.decide("rejected")}><X strokeWidth={2.6} /></RoundAction>
                <RoundAction label="Edit before deciding" tone="neutral" small onClick={() => top && setEditingId(top.id)}><Pencil /></RoundAction>
                <RoundAction label="Approve" tone="approve" onClick={() => topCard.current?.decide("approved")}><Check strokeWidth={2.6} /></RoundAction>
              </div>
              <p className="type-label mt-4 hidden md:block">Arrow keys work too. Press E to edit.</p>
            </motion.div>
          )}
        </AnimatePresence>
      )}

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
