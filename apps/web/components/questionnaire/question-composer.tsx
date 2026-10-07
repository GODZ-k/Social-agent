"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import type { QuestionnaireQuestion } from "@social-agent/shared";
import type { QuestionAnswer } from "@/lib/types";
import { ChipReply } from "@/components/questionnaire/chip-reply";
import { Textarea } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";

/** Answers one question in the chat, live: chips submit at once, a typing chip opens the text box first. */
export function QuestionComposer({
  question,
  disabled,
  onAnswer,
}: {
  question: QuestionnaireQuestion;
  disabled?: boolean;
  onAnswer: (answer: QuestionAnswer) => void;
}) {
  const [typing, setTyping] = useState(question.kind === "text");
  const [text, setText] = useState("");

  function send() {
    const value = text.trim();
    if (!value) return;
    onAnswer(question.kind === "text" ? { kind: "text", text: value } : { kind: "other", text: value });
    setText("");
  }

  return (
    <div className="grid gap-2.5">
      {!typing && (
        <div className="flex flex-wrap gap-2">
          {question.kind === "confirm" && (
            <>
              <ChipReply label="Yes, that's right" onClick={() => onAnswer({ kind: "confirm" })} />
              <ChipReply label="Not quite, let me fix it" kind="other" onClick={() => setTyping(true)} />
            </>
          )}
          {(question.kind === "choice" || question.kind === "range") && (
            <>
              {question.options?.map((option) => (
                <ChipReply key={option.value} label={option.label} onClick={() => onAnswer({ kind: "option", value: option.value })} />
              ))}
              {!question.required && <ChipReply label="Not sure" kind="muted" onClick={() => onAnswer({ kind: "not_sure" })} />}
              <ChipReply label="Something else" kind="other" onClick={() => setTyping(true)} />
            </>
          )}
        </div>
      )}

      {typing && (
        <div className="flex items-end gap-2">
          <Textarea
            autoFocus
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Type your answer"
            disabled={disabled}
            className="min-h-11 flex-1 resize-none"
          />
          <Button size="icon" aria-label="Send" disabled={disabled || !text.trim()} onClick={send}>
            <Send className="size-4" />
          </Button>
        </div>
      )}
      {typing && !question.required && <ChipReply label="Not sure" kind="muted" onClick={() => onAnswer({ kind: "not_sure" })} />}
      {typing && <p className="type-label">In your own words is fine. I&apos;ll ask if anything is unclear.</p>}
    </div>
  );
}
