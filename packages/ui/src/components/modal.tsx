"use client";

import * as React from "react";
import { Dialog, VisuallyHidden } from "radix-ui";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { spring } from "../lib/motion";
import { cn } from "../lib/utils";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Named for screen readers. Draw the visible title inside `children`, where the layout wants it. */
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * A card centred over the page, for the screens that carry their own layout
 * inside them. `Sheet` is the one to reach for otherwise: it is the right shape
 * for a panel beside the page's content, and it keeps a thumb's reach on phones.
 * This one fills the screen below 640px, where a centred card has nowhere to sit.
 */
export function Modal({ open, onOpenChange, title, description, children, className }: ModalProps) {
  const reduceMotion = useReducedMotion();
  const enter = reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 };
  const exit = reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-scrim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={spring.smooth}
              />
            </Dialog.Overlay>
            {/* Centred by the grid, never by a transform: the card's own transform belongs to the animation. */}
            <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center sm:p-6">
              <Dialog.Content asChild forceMount>
                <motion.div
                  className={cn(
                    "pointer-events-auto relative flex w-full flex-col overflow-hidden bg-card shadow-floating outline-none",
                    "h-dvh",
                    "sm:h-auto sm:max-h-[min(44rem,100%)] sm:w-[min(56rem,100%)] sm:rounded-2xl",
                    className,
                  )}
                  initial={exit}
                  animate={enter}
                  exit={exit}
                  transition={spring.smooth}
                >
                  <VisuallyHidden.Root>
                    <Dialog.Title>{title}</Dialog.Title>
                    {description && <Dialog.Description>{description}</Dialog.Description>}
                  </VisuallyHidden.Root>
                  <Dialog.Close
                    className="pressable absolute top-3.5 right-3.5 z-10 grid size-8.5 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
                    aria-label="Close"
                  >
                    <X className="size-4" />
                  </Dialog.Close>
                  {children}
                </motion.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
