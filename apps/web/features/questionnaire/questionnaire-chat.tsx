"use client";

import { useState } from "react";
import { Check, LoaderCircle, Sparkles } from "lucide-react";
import type { QuestionnaireQuestion } from "@social-agent/shared";
import { answerQuestion, submitQuestionnaire } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { QuestionAnswer, QuestionnaireView, ResearchView } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";
import { LanguagePicker } from "@/features/questionnaire/language-picker";
import { AgentMessage, OwnerMessage } from "@/features/questionnaire/chat-message";
import { QuestionComposer } from "@/features/questionnaire/question-composer";
import { EditAnswerFields } from "@/features/questionnaire/edit-answer-fields";
import { AnswersPanel, type AnswerRow } from "@/features/questionnaire/answers-panel";
import { SummaryCard } from "@/features/questionnaire/summary-card";

/** S18a-f: the account manager's guided chat. Approving it (S18e) starts research. */
export function QuestionnaireChat({
  clientId,
  initial,
  onApproved,
}: {
  clientId: string;
  initial: QuestionnaireView | null;
  onApproved: (research: ResearchView) => void;
}) {
  const [view, setView] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const answer = useServerAction(answerQuestion, {
    onSuccess: (next) => {
      setView(next);
      setEditingId(null);
      setNote(null);
    },
    failure: "Couldn't save that answer.",
  });
  const submit = useServerAction(submitQuestionnaire, {
    onSuccess: (result) => {
      // The shared type only promises `Research`; the mock action always hands back the full `ResearchView`.
      if (result.approved) return onApproved(result.research as ResearchView);
      setView((v) => (v && v.session ? { ...v, session: { ...v.session, followUps: [...v.session.followUps, ...result.followUps] } } : v));
      setNote(result.reason);
    },
    failure: "Couldn't send your answers.",
  });

  if (!view || !view.session) return <LanguagePicker clientId={clientId} onStarted={setView} />;
  const session = view.session;
  const allQuestions = [...session.questions, ...session.followUps];
  const nextQuestion = allQuestions.find((q) => session.answers[q.id] === undefined);
  const answerTextFor = (id: string) => view.summary.find((s) => s.questionId === id)?.answer;
  const answeredByFor = (id: string) => view.summary.find((s) => s.questionId === id)?.answeredBy;
  const rows: AnswerRow[] = allQuestions.map((q) => ({
    id: q.id,
    label: view.labels[q.id] ?? q.text,
    answer: answerTextFor(q.id),
    answeredBy: answeredByFor(q.id),
  }));
  const answeredCount = Object.keys(session.answers).length;

  function handleAnswer(questionId: string, value: QuestionAnswer) {
    answer.run(clientId, session.sessionId, questionId, value);
  }

  const editingQuestion = editingId ? allQuestions.find((q) => q.id === editingId) : undefined;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <Panel className="flex flex-col overflow-hidden p-0 md:p-0">
        <header className="flex items-center gap-3 border-b px-5 py-4 md:px-6 md:py-5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tint text-tint-foreground">
            <Sparkles className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Your account manager</p>
            <p className="type-label">{nextQuestion ? `Question ${answeredCount + 1} of ${allQuestions.length}` : "All done"}</p>
          </div>
          <div className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(answeredCount / allQuestions.length) * 100}%` }} />
          </div>
        </header>

        <div className="grid gap-4 p-5 md:p-6" aria-live="polite">
          <AgentMessage>
            Hi! I&apos;m your account manager. Your website told me a lot. A few questions fill in what it can&apos;t, like who buys most and
            what you want posts to do. About {allQuestions.length} questions, 5 minutes.
          </AgentMessage>

          {allQuestions.map((q) => {
            const answered = session.answers[q.id] !== undefined;
            const isFirstFollowUp = note && session.followUps[0]?.id === q.id;
            if (!answered && q.id !== nextQuestion?.id) return null;
            return (
              <div key={q.id} className="grid gap-4">
                {isFirstFollowUp && <AgentMessage>{note}</AgentMessage>}
                <AgentQuestionMessage question={q} />
                {answered && editingId !== q.id && (
                  <OwnerMessage onEdit={() => setEditingId(q.id)}>{answerTextFor(q.id)}</OwnerMessage>
                )}
                {answered && editingId === q.id && (
                  <>
                    <div className="hidden max-w-[34rem] self-end rounded-xl bg-card p-4 ring-1 ring-border md:block">
                      <EditAnswerFields
                        question={q}
                        currentAnswer={answerTextFor(q.id)}
                        saving={answer.isPending}
                        onSave={(a) => handleAnswer(q.id, a)}
                        onCancel={() => setEditingId(null)}
                      />
                    </div>
                    <div className="md:hidden">
                      <OwnerMessage>{answerTextFor(q.id)}</OwnerMessage>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {!nextQuestion && (
            <div className="grid gap-4">
              <AgentMessage>Perfect. Here&apos;s what I understood. Change anything I got wrong:</AgentMessage>
              <SummaryCard rows={rows} onEdit={setEditingId} />
              <AgentMessage>
                When it looks right, I&apos;ll research your market and similar brands. It takes about 5 minutes, and you can leave while I
                work.
              </AgentMessage>
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingId(allQuestions[0]?.id ?? null)}>
                  Change something
                </Button>
                <Button size="lg" disabled={submit.isPending} onClick={() => submit.run(clientId, session.sessionId)}>
                  {submit.isPending ? <LoaderCircle className="animate-spin" /> : <Check />}
                  Looks right, start research
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Docked below a divider, like the language step's chips, instead of scrolling away inside the thread. */}
        {nextQuestion && (
          <div className="border-t p-4 md:px-6">
            <QuestionComposer question={nextQuestion} disabled={answer.isPending} onAnswer={(a) => handleAnswer(nextQuestion.id, a)} />
          </div>
        )}
      </Panel>

      <AnswersPanel chatLanguage={session.chatLanguage} rows={rows} onEdit={setEditingId} />

      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden">
          <button aria-label="Close" className="absolute inset-0 bg-scrim" onClick={() => setEditingId(null)} />
          <div className="relative z-10 w-full rounded-t-2xl bg-card p-5">
            <EditAnswerFields
              question={editingQuestion}
              currentAnswer={answerTextFor(editingQuestion.id)}
              saving={answer.isPending}
              onSave={(a) => handleAnswer(editingQuestion.id, a)}
              onCancel={() => setEditingId(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function AgentQuestionMessage({ question }: { question: QuestionnaireQuestion }) {
  return (
    <AgentMessage>
      {question.prefill && (
        <>
          <p>Your website says:</p>
          <blockquote className="mt-1 rounded-lg bg-card px-3 py-2 text-sm">{question.prefill}</blockquote>
        </>
      )}
      <p className={question.prefill ? "mt-2" : undefined}>{question.text}</p>
      {question.example && <p className="type-label mt-1">For example: {question.example}</p>}
    </AgentMessage>
  );
}
