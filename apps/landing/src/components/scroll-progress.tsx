"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** How far down the page you are, as a hairline across the top. It tracks the scroll 1:1, smoothed by a spring. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 40, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-primary"
      style={{ scaleX }}
    />
  );
}
