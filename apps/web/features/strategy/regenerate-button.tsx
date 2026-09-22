"use client";

import { RefreshButton } from "./refresh-button";
import { useRegenerateStrategy } from "./use-regenerate-strategy";

export function RegenerateStrategyButton({
  clientId,
  disabled,
  idleLabel,
  busyLabel,
  variant,
}: {
  clientId: string;
  disabled?: boolean;
  idleLabel: string;
  busyLabel: string;
  variant?: "outline" | "default";
}) {
  const { regenerate, isPending } = useRegenerateStrategy(clientId);
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
