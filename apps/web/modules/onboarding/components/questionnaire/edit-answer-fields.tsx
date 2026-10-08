"use client";

import { useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import type { QuestionnaireQuestion } from "@social-agent/shared";
import type { QuestionAnswer } from "@/lib/types";
import { ChipReply } from "./chip-reply";
import { Textarea } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";

type Selection = "confirm" | "other" | "not_sure" | string;

/** The shared content of "change your answer" (S18f): picking a chip never resets the box until Save. */
export function EditAnswerFields({
  question,
  currentAnswer,
  saving,
  onSave,
  onCancel,
}: {
  question: QuestionnaireQuestion;
  /** The answer in words, as the summary shows it; undefined when the question was never answered. */
  currentAnswer: string | undefined;
  saving: boolean;
  onSave: (answer: QuestionAnswer) => void;
  onCancel: () => void;
}) {
  const matchedOption = question.options?.find((o) => o.label === currentAnswer);
  const isConfirmed = question.kind === "confirm" && currentAnswer === question.prefill;
  const [selected, setSelected] = useState<Selection>(initialSelection());
  const [text, setText] = useState(initialText());

  function initialSelection(): Selection {
    if (currentAnswer === "Not sure") return "not_sure";
    if (question.kind === "confirm") return isConfirmed ? "confirm" : "other";
    if (matchedOption) return matchedOption.value;
    return "other";
  }

  function initialText(): string {
    return needsText(initialSelection()) ? (currentAnswer ?? "") : "";
  }

  /** Whether this selection needs the free-text box filled in before saving. */
  function needsText(value: Selection) {
    return value === "other" || (question.kind === "text" && value !== "not_sure");
  }

  function save() {
    if (selected === "confirm") return onSave({ kind: "confirm" });
    if (selected === "not_sure") return onSave({ kind: "not_sure" });
    const value = text.trim();
    if (!value) return;
    return onSave(question.kind === "text" ? { kind: "text", text: value } : { kind: "other", text: value });
  }

  const showText = needsText(selected);
  const disableSave = showText && !text.trim();

  return (
    <div className="grid gap-3">
      <p className="type-label">Change your answer</p>
      <p className="font-medium">{question.text}</p>

      {question.kind === "confirm" && (
        <div className="flex flex-wrap gap-2">
          <ChipReply label="Yes, that's right" selected={selected === "confirm"} onClick={() => setSelected("confirm")} />
          <ChipReply label="Not quite, let me fix it" kind="other" selected={selected === "other"} onClick={() => setSelected("other")} />
        </div>
      )}
      {(question.kind === "choice" || question.kind === "range") && (
        <div className="flex flex-wrap gap-2">
          {question.options?.map((option) => (
            <ChipReply key={option.value} label={option.label} selected={selected === option.value} onClick={() => setSelected(option.value)} />
          ))}
          {!question.required && (
            <ChipReply label="Not sure" kind="muted" selected={selected === "not_sure"} onClick={() => setSelected("not_sure")} />
          )}
          <ChipReply label="Something else" kind="other" selected={selected === "other"} onClick={() => setSelected("other")} />
        </div>
      )}
      {question.kind === "text" && !question.required && (
        <div className="flex flex-wrap gap-2">
          <ChipReply label="Not sure" kind="muted" selected={selected === "not_sure"} onClick={() => setSelected("not_sure")} />
        </div>
      )}

      {showText && <Textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your answer" />}

      <p className="type-label">Your other answers stay as they are.</p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={save} disabled={saving || disableSave}>
          {saving ? <LoaderCircle className="animate-spin" /> : <Check />}
          Save
        </Button>
      </div>
    </div>
  );
}
