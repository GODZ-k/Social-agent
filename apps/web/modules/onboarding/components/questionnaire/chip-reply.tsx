import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

/** One tappable reply in the questionnaire chat. The "other" kind opens a text box instead of answering right away. */
export function ChipReply({
  label,
  onClick,
  kind = "option",
  selected,
}: {
  label: string;
  onClick: () => void;
  kind?: "option" | "other" | "muted";
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "pressable inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium",
        kind === "muted" && "text-muted-foreground hover:text-foreground",
        kind === "other" && "bg-card text-foreground ring-1 ring-border",
        kind === "option" &&
          (selected
            ? "bg-primary text-primary-foreground"
            : "bg-tint text-tint-foreground ring-1 ring-tint-strong hover:bg-tint-strong"),
      )}
    >
      {kind === "other" && <Pencil className="size-3.5" />}
      {label}
    </button>
  );
}
