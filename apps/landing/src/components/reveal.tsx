"use client";

import { motion, type Variants } from "motion/react";
import { spring } from "@repo/ui/lib/motion";

// A reveal answers the scroll that brought the content into view. It is short,
// has no overshoot, and plays once, so scrolling back up never replays it.
// MotionConfig reducedMotion="user" drops the movement and keeps the fade.
const transition = { ...spring.smooth, duration: 0.65 };
const viewport = { once: true, margin: "0px 0px -12% 0px" } as const;

const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  shown: { opacity: 1, y: 0, transition },
};

/** One block that settles into place as it enters the viewport. */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ ...transition, delay }}
    >
      {children}
    </motion.div>
  );
}

const TAGS = { div: motion.div, ul: motion.ul, ol: motion.ol, li: motion.li } as const;

/** A list whose items arrive one after another. Wrap each item in RevealItem. */
export function RevealGroup({
  children,
  className,
  as = "div",
  stagger = 0.07,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol";
  stagger?: number;
}) {
  const Tag = TAGS[as];
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={viewport}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({
  children,
  className,
  as = "div",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li";
  id?: string;
}) {
  const Tag = TAGS[as];
  return (
    <Tag id={id} className={className} variants={item}>
      {children}
    </Tag>
  );
}
