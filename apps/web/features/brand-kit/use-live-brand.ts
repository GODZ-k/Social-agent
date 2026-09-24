"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";
import type { Values } from "@/features/brand-kit/schema";
import type { BrandColor, BrandKit } from "@social-agent/shared";
import { isValidHex } from "@/lib/utils";

/** The preview and the page tint follow the form as it's edited. */
export function useLiveBrand(form: UseFormReturn<Values>, saved: BrandKit): { brand: BrandKit; hook: string } {
  const live = useWatch({ control: form.control });
  const liveColors = (live.colors ?? []).filter((c): c is BrandColor => !!c?.hex && isValidHex(c.hex));
  return {
    brand: { ...saved, colors: liveColors.length ? liveColors : saved.colors },
    hook: live.tagline || "Your headline here",
  };
}
