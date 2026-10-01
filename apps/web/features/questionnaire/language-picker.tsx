"use client";

import { ArrowLeft, LoaderCircle, Sparkles } from "lucide-react";
import type { Language } from "@social-agent/shared";
import { startQuestionnaire } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { QuestionnaireView } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";
import { ChipReply } from "@/features/questionnaire/chip-reply";
import { AgentMessage } from "@/features/questionnaire/chat-message";
import { AnswersPanel, type AnswerRow } from "@/features/questionnaire/answers-panel";

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी" },
  { value: "hinglish", label: "Hinglish" },
];

/** The topics every questionnaire covers, shown as "Not asked yet" before the first question loads. */
const PLACEHOLDER_ROWS: AnswerRow[] = [
  { id: "offer", label: "You sell", answer: undefined },
  { id: "goal", label: "Posts should", answer: undefined },
  { id: "customer", label: "Best customers", answer: undefined },
  { id: "order", label: "Typical order", answer: undefined },
  { id: "lang", label: "Posts in", answer: undefined },
];

/** The questionnaire's first message (S18a): pick the chat language, then the account manager starts asking. */
export function LanguagePicker({
  brandId,
  onStarted,
  onBack,
}: {
  brandId: string;
  onStarted: (view: QuestionnaireView) => void;
  /** Set when reached by stepping back into this step; see `QuestionnaireChat`. */
  onBack?: () => void;
}) {
  const start = useServerAction(startQuestionnaire, { onSuccess: onStarted, failure: "Couldn't start the questionnaire." });

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <Panel className="flex flex-col overflow-hidden p-0 md:p-0">
        <header className="flex items-center gap-3 border-b px-5 py-4 md:px-6 md:py-5">
          {onBack && (
            <Button type="button" variant="ghost" size="sm" className="-ml-2 shrink-0" onClick={onBack}>
              <ArrowLeft aria-hidden />
              Back
            </Button>
          )}
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tint text-tint-foreground">
            <Sparkles className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Your account manager</p>
            <p className="type-label">About 8 questions, 5 minutes</p>
          </div>
          <div className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-secondary" />
        </header>

        <div className="grid gap-4 p-5 md:p-6" aria-live="polite">
          <AgentMessage>
            Hi! I&apos;m your account manager. Your website told me a lot. A few questions fill in what it can&apos;t, like who buys most and
            what you want posts to do. About 8 questions, 5 minutes.
          </AgentMessage>
          <AgentMessage>Which language should we chat in?</AgentMessage>
        </div>

        <div className="border-t px-5 py-4 md:px-6 md:py-5">
          <div className="flex flex-wrap items-center gap-2">
            {start.isPending ? (
              <span className="type-label flex items-center gap-1.5">
                <LoaderCircle className="size-3.5 animate-spin" />
                Starting the questionnaire
              </span>
            ) : (
              LANGUAGES.map((lang) => <ChipReply key={lang.value} label={lang.label} onClick={() => start.run(brandId, lang.value)} />)
            )}
          </div>
          <p className="type-label mt-2.5">Tap one to start. You pick the language for your posts later.</p>
        </div>
      </Panel>

      <AnswersPanel chatLanguage={null} rows={PLACEHOLDER_ROWS} onEdit={() => {}} />
    </div>
  );
}
