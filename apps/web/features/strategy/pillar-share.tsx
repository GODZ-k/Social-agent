"use client";

import { motion } from "motion/react";
import { spring } from "@repo/ui/lib/motion";

export function PillarShare({ share }: { share: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
        {/* Slides rather than resizes, so only transform animates. */}
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={false}
          animate={{ x: `${share - 100}%` }}
          transition={spring.smooth}
        />
      </div>
      <span className="type-number w-11 text-right text-[1.0625rem]">{share}%</span>
    </div>
  );
}
