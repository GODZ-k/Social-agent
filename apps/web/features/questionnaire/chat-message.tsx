import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

/** The account manager's side of the chat. */
export function AgentMessage({ children }: { children: React.ReactNode }) {
  return <div className="max-w-[34rem] rounded-2xl rounded-tl-md bg-secondary px-4 py-3">{children}</div>;
}

/** The owner's own answer, shown right-aligned. Answered questions can be tapped to change them. */
export function OwnerMessage({ children, onEdit }: { children: React.ReactNode; onEdit?: () => void }) {
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={!onEdit}
        onClick={onEdit}
        className={cn(
          "max-w-[34rem] rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-left text-primary-foreground",
          onEdit && "pressable",
        )}
      >
        {children}
      </button>
      {onEdit && (
        <span className="type-label flex items-center gap-1">
          <Pencil className="size-3" />
          Tap your answer to change it
        </span>
      )}
    </div>
  );
}
