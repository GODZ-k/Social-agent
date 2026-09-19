"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { Check } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { ClientAvatar } from "@repo/ui/components/social/client-avatar";
import { PostArt } from "@repo/ui/components/social/post-art";
import { spring } from "@repo/ui/lib/motion";
import { brandStyle, cn } from "@repo/ui/lib/utils";
import { BRANDS } from "@/lib/content/brands";
import { retintPosts } from "@/lib/content/posts";

const DWELL_MS = 3200;

/**
 * The page's one orchestrated moment: the same three posts, and the same
 * interface around them, re-made in one example brand after another. It runs
 * on its own until the visitor picks a brand, then it is theirs to drive.
 */
export function RetintDemo() {
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const reduceMotion = useReducedMotion();
  const chips = useRef<(HTMLButtonElement | null)[]>([]);

  // The cards start as one overlapped stack and spread into a row as the section
  // scrolls into view. Tied to the scroll position, so it reverses if you scroll back.
  const grid = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: grid, offset: ["start 96%", "start 48%"] });
  const spread = useSpring(scrollYProgress, { stiffness: 180, damping: 32, restDelta: 0.001 });

  // What the cards follow. It starts at 0 on the server and in the first client
  // render alike (so hydration matches), then either tracks the scroll or, for
  // people who asked for less motion, goes straight to the finished row.
  const fan = useMotionValue(0);
  useEffect(() => {
    if (reduceMotion) {
      fan.set(1);
      return;
    }
    fan.set(spread.get());
    return spread.on("change", (v) => fan.set(v));
  }, [reduceMotion, spread, fan]);

  useEffect(() => {
    // Nothing moves on its own for people who asked for less motion.
    if (!auto || reduceMotion) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % BRANDS.length), DWELL_MS);
    return () => window.clearInterval(timer);
  }, [auto, reduceMotion]);

  const brand = BRANDS[index]!;
  const posts = retintPosts(brand);

  function choose(next: number) {
    setAuto(false);
    setIndex(next);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + BRANDS.length) % BRANDS.length;
    choose(next);
    chips.current[next]?.focus();
  }

  return (
    <div>
      <div role="radiogroup" aria-label="Example brand" className="flex flex-wrap gap-2" onKeyDown={onKeyDown}>
        {BRANDS.map((b, i) => {
          const selected = i === index;
          return (
            // Each chip wears its own brand, so the row previews all four at once.
            <button
              key={b.id}
              ref={(el) => {
                chips.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => choose(i)}
              style={brandStyle(b.accent)}
              className={cn(
                "brand-scope pressable flex items-center gap-2 rounded-full py-1.5 pr-3.5 pl-1.5 text-sm font-medium transition-colors",
                selected ? "bg-tint-strong text-tint-foreground" : "bg-card text-muted-foreground shadow-raised hover:text-foreground",
              )}
            >
              <ClientAvatar client={b} className="size-6 text-[0.6875rem]" />
              {b.name}
            </button>
          );
        })}
      </div>

      <div className="brand-scope mt-6" style={brandStyle(brand.accent)}>
        <div ref={grid} className="grid grid-cols-3 items-start gap-2.5 md:gap-5">
          {posts.map((post, i) => (
            <FanCard key={i} index={i} spread={fan}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ ...spring.smooth, delay: i * 0.06 }}
                >
                  <PostArt post={post} brand={brand.kit} fixedAspect="aspect-[4/5]" className="rounded-xl shadow-raised" />
                </motion.div>
              </AnimatePresence>
            </FanCard>
          ))}
        </div>

        {/* The chrome follows the brand too: tint, ink and the primary fill all re-derive from one colour. */}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl bg-tint px-5 py-4" aria-live="polite">
          {/* On phones the text takes its own row, so the badge and button don't squeeze it into a column. */}
          <div className="min-w-0 flex-1 basis-full sm:basis-0">
            <p className="font-medium text-tint-foreground">{brand.name}</p>
            <p className="type-label">{brand.kind}. Colours and tone read from its website.</p>
          </div>
          <Badge variant="tint">3 posts drafted</Badge>
          {/* Decorative: it shows the accent on a real control, it doesn't approve anything. */}
          <Button size="sm" tabIndex={-1} aria-hidden className="pointer-events-none">
            <Check /> Approve
          </Button>
        </div>
      </div>
    </div>
  );
}

/** One card of the fan: the outer two slide out from behind the middle one and straighten as `spread` goes 0 to 1. */
function FanCard({
  index,
  spread,
  children,
}: {
  index: number;
  spread: MotionValue<number>;
  children: React.ReactNode;
}) {
  const side = index - 1; // -1 left, 0 middle, 1 right
  const x = useTransform(spread, [0, 1], [`${-side * 62}%`, "0%"]);
  const y = useTransform(spread, [0, 1], [48 + Math.abs(side) * 10, 0]);
  const rotate = useTransform(spread, [0, 1], [side * 9, 0]);
  const scale = useTransform(spread, [0, 1], [0.86, 1]);
  const opacity = useTransform(spread, [0, 0.35], [0, 1]);

  return (
    <motion.div
      className="relative min-w-0"
      // The middle card sits on top while they overlap.
      style={{ x, y, rotate, scale, opacity, zIndex: side === 0 ? 1 : 0 }}
    >
      {children}
    </motion.div>
  );
}
