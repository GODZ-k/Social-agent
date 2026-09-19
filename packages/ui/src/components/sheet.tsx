"use client";

import * as React from "react";
import { Dialog } from "radix-ui";
import { AnimatePresence, motion, useDragControls, useReducedMotion, type PanInfo } from "motion/react";
import { X } from "lucide-react";
import { useIsDesktop } from "../hooks/use-media-query";
import { project, spring } from "../lib/motion";
import { cn } from "../lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * A panel that rises from the bottom on phones and slides in from the right
 * on larger screens. It leaves the way it came, tracks the finger 1:1 while
 * dragged, and decides whether to dismiss from where the flick is heading,
 * not from where it was released.
 */
export function Sheet({ open, onOpenChange, title, description, children, footer, className }: SheetProps) {
  const isDesktop = useIsDesktop();
  const reduceMotion = useReducedMotion();
  const panelRef = React.useRef<HTMLDivElement>(null);
  // The sheet is dragged by its handle and header only. Its content keeps every
  // pointer event, so sliders, dials and anything else draggable work inside it.
  const dragControls = useDragControls();
  const startDrag = (e: React.PointerEvent) => {
    if (!reduceMotion && !(e.target as HTMLElement).closest("button, a, input")) dragControls.start(e);
  };

  const axis = isDesktop ? "x" : "y";
  const offscreen = reduceMotion ? { opacity: 0 } : isDesktop ? { x: "100%" } : { y: "100%" };
  const onscreen = reduceMotion ? { opacity: 1 } : isDesktop ? { x: 0 } : { y: 0 };

  function handleDragEnd(_: unknown, info: PanInfo) {
    const size = isDesktop ? panelRef.current?.offsetWidth : panelRef.current?.offsetHeight;
    const travelled = info.offset[axis];
    const resting = travelled + project(info.velocity[axis]);
    if (resting > (size ?? 400) * 0.5) onOpenChange(false);
  }

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
            <Dialog.Content asChild forceMount>
              <motion.div
                ref={panelRef}
                className={cn(
                  "fixed z-50 flex flex-col bg-card shadow-floating outline-none",
                  "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-2xl",
                  "md:inset-x-auto md:inset-y-3 md:right-3 md:max-h-none md:w-[min(30rem,calc(100vw-1.5rem))] md:rounded-2xl",
                  className,
                )}
                initial={offscreen}
                animate={onscreen}
                exit={offscreen}
                transition={spring.sheet}
                drag={reduceMotion ? false : axis}
                dragControls={dragControls}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
                // Free in the dismiss direction, rubber-banded against it.
                dragElastic={isDesktop ? { left: 0.06, right: 1 } : { top: 0.06, bottom: 1 }}
                dragSnapToOrigin={false}
                onDragEnd={handleDragEnd}
              >
                {/* A tall, invisible grab area around a small visible handle: easy to catch with a thumb. */}
                <div onPointerDown={startDrag} className="-mb-2 flex shrink-0 cursor-grab touch-none justify-center pt-2.5 pb-2 active:cursor-grabbing md:hidden" aria-hidden>
                  <span className="h-1 w-9 rounded-full bg-input" />
                </div>
                <header onPointerDown={startDrag} className="flex touch-none items-start gap-4 px-5 pt-4 pb-3 md:px-6 md:pt-6">
                  <div className="min-w-0 flex-1">
                    <Dialog.Title className="type-heading">{title}</Dialog.Title>
                    {description && (
                      <Dialog.Description className="type-label mt-1">{description}</Dialog.Description>
                    )}
                  </div>
                  <Dialog.Close
                    className="pressable -mr-1.5 grid size-8.5 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
                    aria-label="Close"
                  >
                    <X className="size-4" />
                  </Dialog.Close>
                </header>
                <div
                  className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 md:px-6"
                >
                  {children}
                </div>
                {footer && (
                  <footer className="flex gap-2.5 border-t px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] md:px-6">
                    {footer}
                  </footer>
                )}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
