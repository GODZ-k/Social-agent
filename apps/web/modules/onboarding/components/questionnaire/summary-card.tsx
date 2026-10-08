import { Pencil } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import type { AnswerRow } from "@/modules/onboarding/types";

/** "Perfect, here's what I understood" (S18e): every answer, changeable right from the summary. */
export function SummaryCard({ rows, onEdit }: { rows: AnswerRow[]; onEdit: (id: string) => void }) {
  return (
    <div className="grid gap-3 rounded-xl bg-card p-4 ring-1 ring-border">
      {rows.map((row) => (
        <div key={row.id} className="flex items-start justify-between gap-3 border-t pt-3 first:border-t-0 first:pt-0">
          <div className="min-w-0">
            <p className="type-label">{row.label}</p>
            <p className="mt-0.5">{row.answer}</p>
            {row.answeredBy === "agency" && <p className="type-label mt-0.5 text-tint-foreground">Answered by the agency</p>}
          </div>
          <Button variant="ghost" size="sm" onClick={() => onEdit(row.id)} className="shrink-0">
            <Pencil className="size-3.5" />
            Change
          </Button>
        </div>
      ))}
    </div>
  );
}
