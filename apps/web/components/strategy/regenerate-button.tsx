"use client";

import { RefreshButton } from "./refresh-button";
import { useRegenerateStrategy } from "@/hooks/use-regenerate-strategy";

export function RegenerateStrategyButton({
  brandId,
  disabled,
  idleLabel,
  busyLabel,
  variant,
}: {
  brandId: string;
  disabled?: boolean;
  idleLabel: string;
  busyLabel: string;
  variant?: "outline" | "default";
}) {
  const { regenerate, isPending } = useRegenerateStrategy(brandId);
  return (
    <RefreshButton
      isPending={isPending}
      disabled={disabled}
      idleLabel={idleLabel}
      busyLabel={busyLabel}
      variant={variant}
      onClick={regenerate}
    />
  );
}
