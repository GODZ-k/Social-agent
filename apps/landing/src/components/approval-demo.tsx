"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useMotionValue } from "motion/react";
import { Check, PartyPopper, X } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { EmptyState } from "@repo/ui/components/states";
import { SwipeCard, type Decision, type SwipeCardHandle } from "@repo/ui/components/social/swipe-card";
import { brandStyle } from "@repo/ui/lib/utils";
import { BRANDS } from "@/lib/content/brands";
import { DEMO_POSTS } from "@/lib/content/posts";

const brand = BRANDS[0]!;

/** The product's approval stack with example posts. The cards are the real ones: drag, flick, or use the buttons. */
export function ApprovalDemo() {
  const [queue, setQueue] = useState(DEMO_POSTS);
  const [last, setLast] = useState<{ decision: Decision; hook: string } | null>(null);
  const top = queue[0];
  const topCard = useRef<SwipeCardHandle>(null);

  // Shared with every card so the ones beneath can rise as the top one leaves.
  const lead = useMotionValue(0);
  useLayoutEffect(() => {
    lead.set(0);
  }, [top?.id, lead]);

  function decide(decision: Decision) {
    if (top) setLast({ decision, hook: top.hook });
    setQueue((q) => q.slice(1));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") topCard.current?.decide("approved");
    else if (e.key === "ArrowLeft") topCard.current?.decide("rejected");
  }

  return (
    <div className="brand-scope mx-auto w-full max-w-[24rem]" style={brandStyle(brand.accent)}>
      {top ? (
        <>
          <div
            role="group"
            aria-label="Example posts waiting for approval. Left arrow rejects, right arrow approves."
            tabIndex={0}
            onKeyDown={onKeyDown}
            className="relative h-[28rem] w-full rounded-2xl pb-8 md:h-[30rem]"
          >
            <div className="relative size-full">
              {queue
                .slice(0, 3)
                .map((post, index) => (
                  <SwipeCard
                    key={post.id}
                    ref={index === 0 ? topCard : undefined}
                    post={post}
                    brand={brand.kit}
                    index={index}
                    lead={lead}
                    onDecide={decide}
                  />
                ))
                .reverse()}
            </div>
          </div>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => topCard.current?.decide("rejected")}>
              <X /> Reject
            </Button>
            <Button onClick={() => topCard.current?.decide("approved")}>
              <Check /> Approve
            </Button>
          </div>
        </>
      ) : (
        <div className="grid h-[28rem] place-items-center rounded-2xl bg-card shadow-raised md:h-[30rem]">
          <EmptyState
            icon={<PartyPopper />}
            title="That's the queue cleared."
            description="In the product, approved posts are now on the calendar with their publish times."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQueue(DEMO_POSTS);
                  setLast(null);
                }}
              >
                Start again
              </Button>
            }
          />
        </div>
      )}
      <p className="type-label mt-4 flex min-h-6 items-center justify-center gap-2" aria-live="polite">
        {last ? (
          <>
            <Badge variant={last.decision === "approved" ? "success" : "danger"}>
              {last.decision === "approved" ? "Approved" : "Rejected"}
            </Badge>
            <span className="truncate">{last.hook}</span>
          </>
        ) : (
          "Drag a card, or use the buttons. These are example posts."
        )}
      </p>
    </div>
  );
}
