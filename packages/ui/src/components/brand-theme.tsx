"use client";

import { useEffect } from "react";
import { BRAND_PROPERTIES, brandProperties } from "../lib/utils";

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
    const properties = brandProperties(color);
    for (const [name, value] of Object.entries(properties)) root.style.setProperty(name, value);
    return () => {
      for (const name of BRAND_PROPERTIES) root.style.removeProperty(name);
    };
  }, [color]);

  return null;
}
