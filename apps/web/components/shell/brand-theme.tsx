"use client";

import { useEffect } from "react";
import { readableOn } from "@/lib/utils";

/**
 * Tints the whole document to a client's brand colour while their workspace
 * is open. Set on <html> rather than a wrapper so portalled UI (sheets,
 * menus, toasts) picks it up too. The colour transition is registered once,
 * so moving between clients eases instead of flashing.
 */
export function BrandTheme({ color }: { color: string | undefined }) {
  useEffect(() => {
    if (!color) return;
    const root = document.documentElement;
    root.style.setProperty("--brand", color);
    root.style.setProperty("--brand-foreground", readableOn(color));
    return () => {
      root.style.removeProperty("--brand");
      root.style.removeProperty("--brand-foreground");
    };
  }, [color]);

  return null;
}
