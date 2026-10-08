import { LoaderCircle, RefreshCw } from "lucide-react";
import { Button } from "@repo/ui/components/button";

/**
 * The face of every "rewrite the strategy" button: icon or spinner plus the
 * matching label. The caller owns the action and the pending state.
 */
export function RefreshButton({
  isPending,
  disabled,
  idleLabel,
  busyLabel,
  variant = "outline",
  onClick,
}: {
  isPending: boolean;
  disabled?: boolean;
  idleLabel: string;
  busyLabel: string;
  variant?: "outline" | "default";
  onClick: () => void;
}) {
  return (
    <Button variant={variant} onClick={onClick} disabled={isPending || disabled}>
      {isPending ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}
      {isPending ? busyLabel : idleLabel}
    </Button>
  );
}
