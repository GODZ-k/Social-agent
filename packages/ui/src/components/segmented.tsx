"use client";

import * as React from "react";
import { motion } from "motion/react";
import { spring } from "../lib/motion";
import { cn } from "../lib/utils";

interface SegmentedProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  options: { value: T; label: string; count?: number }[];
  label: string;
  className?: string;
}

/** Radio group whose selection pill slides between options instead of blinking. */
export function Segmented<T extends string>({ value, onValueChange, options, label, className }: SegmentedProps<T>) {
  const id = React.useId();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex max-w-full overflow-x-auto rounded-full bg-secondary p-1", className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "relative shrink-0 rounded-full px-3.5 py-1.5 text-[0.8125rem] font-medium whitespace-nowrap transition-colors",
              selected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {selected && (
              <motion.span
                layoutId={`segmented-${id}`}
                className="absolute inset-0 rounded-full bg-card shadow-raised"
                transition={spring.snappy}
              />
            )}
            <span className="relative">
              {option.label}
              {option.count !== undefined && (
                <span className="ml-1.5 tabular-nums text-muted-foreground">{option.count}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
