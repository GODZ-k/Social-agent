import { Pencil } from "lucide-react";
import { Panel } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";
import type { AnswerRow } from "@/modules/onboarding/types";

const LANGUAGE_LABEL: Record<string, string> = { en: "English", hi: "हिन्दी", hinglish: "Hinglish" };

/** The running summary beside the chat: every question asked so far, tap any one to change it. */
export function AnswersPanel({
  chatLanguage,
  rows,
  onEdit,
}: {
  /** Null before the language is picked, shown as "Not asked yet" like any other question. */
  chatLanguage: string | null;
  rows: AnswerRow[];
  onEdit: (id: string) => void;
}) {
  return (
    <aside className="hidden lg:block">
      <Panel>
        <h2 className="type-heading">Your answers</h2>
        <p className="type-label mt-0.5">Tap any one to change it.</p>
        <dl className="mt-4 grid">
          <AnswerRowView label="Chat language" answer={chatLanguage ? (LANGUAGE_LABEL[chatLanguage] ?? chatLanguage) : undefined} />
          {rows.map((row) => (
            <AnswerRowView
              key={row.id}
              label={row.label}
              answer={row.answer}
              answeredBy={row.answeredBy}
              onEdit={row.answer !== undefined ? () => onEdit(row.id) : undefined}
            />
          ))}
        </dl>
      </Panel>
    </aside>
  );
}

function AnswerRowView({
  label,
  answer,
  answeredBy,
  onEdit,
}: {
  label: string;
  answer: string | undefined;
  answeredBy?: "agency" | "client";
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-2 border-t py-2.5 first:border-t-0 first:pt-0">
      <div className="min-w-0">
        <dt className="type-label">{label}</dt>
        <dd className={answer === undefined ? "type-label mt-1.5" : "mt-0.5"}>{answer ?? "Not asked yet"}</dd>
        {answeredBy === "agency" && <p className="type-label mt-0.5 text-tint-foreground">Answered by the agency</p>}
      </div>
      {onEdit && (
        <Button variant="ghost" size="icon-sm" className="shrink-0" aria-label={`Change ${label}`} onClick={onEdit}>
          <Pencil className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
