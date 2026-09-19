"use client";

import * as React from "react";
import { Popover as Primitive } from "radix-ui";
import { cn } from "../lib/utils";

const Popover = Primitive.Root;
const PopoverTrigger = Primitive.Trigger;
const PopoverClose = Primitive.Close;

function PopoverContent({ className, align = "start", sideOffset = 8, ...props }: React.ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        align={align}
        sideOffset={sideOffset}
        collisionPadding={12}
        // Grows out of its trigger, like the menus, so it's clear what opened it.
        className={cn(
          // Solid, not the translucent material: a picker opens over dense form text and has to stay legible.
          "z-[70] origin-(--radix-popover-content-transform-origin) rounded-lg bg-popover p-3 text-popover-foreground shadow-floating ring-1 ring-border outline-none",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "duration-150 ease-out-soft",
          className,
        )}
        {...props}
      />
    </Primitive.Portal>
  );
}

export { Popover, PopoverClose, PopoverContent, PopoverTrigger };
