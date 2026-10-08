"use client";

import { AnimatePresence, motion } from "motion/react";
import type { BrandSettingsTab } from "@/config/routes";
import { spring } from "@repo/ui/lib/motion";

export function TabTransition({ tab, children }: { tab: BrandSettingsTab; children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={spring.snappy}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
