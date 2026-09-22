"use client";

import { isSameMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";

export function MonthNav({ month, onToday, onStep }: { month: Date; onToday: () => void; onStep: (step: 1 | -1) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <Button variant="outline" size="sm" onClick={onToday} disabled={isSameMonth(month, new Date())}>
        Today
      </Button>
      <Button variant="outline" size="icon-sm" aria-label="Previous month" onClick={() => onStep(-1)}><ChevronLeft /></Button>
      <Button variant="outline" size="icon-sm" aria-label="Next month" onClick={() => onStep(1)}><ChevronRight /></Button>
    </div>
  );
}
