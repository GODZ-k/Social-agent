"use client";

import * as React from "react";
import { Switch as Primitive } from "radix-ui";
import { cn } from "../lib/utils";

function Switch({ className, ...props }: React.ComponentProps<typeof Primitive.Root>) {
  return (
    <Primitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full bg-input p-0.5 transition-colors duration-200 data-[state=checked]:bg-primary disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <Primitive.Thumb className="block size-6 rounded-full bg-white shadow-raised transition-transform duration-200 ease-out-soft data-[state=checked]:translate-x-5" />
    </Primitive.Root>
  );
}

export { Switch };
