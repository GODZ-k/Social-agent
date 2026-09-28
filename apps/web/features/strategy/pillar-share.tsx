"use client";

import { motion } from "motion/react";
import { spring } from "@repo/ui/lib/motion";

/** The full-width bar under a pillar's name and description. */
export function PillarShare({ share }: { share: number }) {
  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
      {/* Slides rather than resizes, so only transform animates. */}
      <motion.div className="h-full rounded-full bg-primary" initial={false} animate={{ x: `${share - 100}%` }} transition={spring.smooth} />
    </div>
  );
}
