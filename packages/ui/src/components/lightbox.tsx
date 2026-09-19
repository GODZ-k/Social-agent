"use client";

import * as React from "react";
import { Dialog } from "radix-ui";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { spring } from "../lib/motion";

/**
 * Shows something at full size over a dimmed page. It grows out of the middle of
 * the screen and returns there; Escape, the close button or a click on the
 * backdrop dismisses it.
 */
export function Lightbox({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Read to screen readers; not shown. */
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[60] bg-black/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={spring.smooth}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                className="fixed inset-0 z-[60] grid place-items-center p-4 outline-none md:p-10"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={spring.smooth}
                onClick={(e) => e.target === e.currentTarget && onOpenChange(false)}
              >
                <Dialog.Title className="sr-only">{title}</Dialog.Title>
                {children}
                <Dialog.Close
                  aria-label="Close"
                  className="pressable absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white/25"
                >
                  <X className="size-5" />
                </Dialog.Close>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
