"use client";

import { useEffect, useEffectEvent } from "react";

interface Handlers {
  /** Off while a sheet, the viewer or the dialog is open, or the queue is empty. */
  enabled: boolean;
  onApprove: () => void;
  onReject: () => void;
  onAsk: () => void;
  onRead: () => void;
}

/** Arrow keys mirror the swipe directions; E asks for changes; Space reads the full post. */
export function useApprovalShortcuts({ enabled, onApprove, onReject, onAsk, onRead }: Handlers) {
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("input, textarea, [contenteditable], [role='dialog']")) return;
    if (e.key === "ArrowRight") onApprove();
    else if (e.key === "ArrowLeft") onReject();
    else if (e.key.toLowerCase() === "e") onAsk();
    // Space on a focused button belongs to that button.
    else if (e.key === " " && !target.closest("button, a")) {
      e.preventDefault();
      onRead();
    }
  });

  useEffect(() => {
    if (!enabled) return;
    const listener = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [enabled]);
}
