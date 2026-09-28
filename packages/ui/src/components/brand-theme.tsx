"use client";

import { useEffect } from "react";
import { BRAND_PROPERTIES, brandProperties, luminance } from "../lib/utils";

const WHITE_TEXT_CONTRAST = 4.5;

function darken(hex: string, amount: number) {
  const rgb = parseInt(hex.replace("#", "").padStart(6, "0"), 16);
  const channels = [(rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255].map((channel) => Math.round(channel * (1 - amount)));
  return "#" + channels.map((channel) => channel.toString(16).padStart(2, "0")).join("");
}

/**
 * The brand colour as a fill that white text reads on at 4.5:1. A deep brand
 * colour is returned untouched; a light one (yellow, sky blue) is darkened in
 * small steps, keeping its hue, until it passes.
 */
export function workspaceAccent(hex: string) {
  const full = hex.length === 4 ? "#" + [...hex.slice(1)].map((c) => c + c).join("") : hex;
  for (let amount = 0; amount < 1; amount += 0.04) {
    const candidate = darken(full, amount);
    if (1.05 / (luminance(candidate) + 0.05) >= WHITE_TEXT_CONTRAST) return candidate;
  }
  return "#000000";
}

/**
 * Tints the whole document to a brand's colour while its workspace is open.
 * Set on <html> rather than a wrapper so portalled UI (sheets, menus, toasts)
 * picks it up too. The colour transition is registered once, so moving
 * between brands eases instead of flashing.
 */
export function BrandTheme({ color }: { color: string | undefined }) {
  useEffect(() => {
    if (!color) return;
    const root = document.documentElement;
    const accent = workspaceAccent(color);
    const properties = brandProperties(accent);
    for (const [name, value] of Object.entries(properties)) root.style.setProperty(name, value);
    return () => {
      for (const name of BRAND_PROPERTIES) root.style.removeProperty(name);
    };
  }, [color]);

  return null;
}
