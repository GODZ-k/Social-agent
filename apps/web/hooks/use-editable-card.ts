"use client";

import { useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { Values } from "@/lib/forms/brand-kit";
import type { CardControls, CardKey } from "@/components/brand-kit/types";

const CARD_FIELDS: Record<CardKey, (keyof Values)[]> = {
  business: ["name", "industry", "summary", "tagline"],
  contact: ["contactEmail", "contactPhone", "contactAddress", "contactHours"],
  audience: ["audience"],
  voice: ["voice"],
  looks: ["colors", "headingFont", "bodyFont"],
};

/** Only one brand-kit card is open at a time; Cancel restores the values from when Edit was tapped. */
export function useEditableCard(form: UseFormReturn<Values>) {
  const [editingCard, setEditingCard] = useState<CardKey | null>(null);
  const snapshot = useRef<Partial<Record<keyof Values, unknown>>>({});

  function cardProps(card: CardKey): CardControls {
    return {
      editing: editingCard === card,
      onEdit: () => {
        for (const field of CARD_FIELDS[card]) snapshot.current[field] = form.getValues(field);
        setEditingCard(card);
      },
      onCancel: () => {
        for (const field of CARD_FIELDS[card]) form.setValue(field, snapshot.current[field] as never);
        setEditingCard(null);
      },
      onDone: () => setEditingCard(null),
    };
  }

  return { cardProps };
}
