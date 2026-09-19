import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "pressable inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium select-none disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-raised hover:brightness-105",
        secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
        outline: "border bg-card text-foreground hover:bg-accent",
        ghost: "text-foreground hover:bg-accent",
        tint: "bg-tint text-tint-foreground hover:bg-tint-strong",
        destructive: "bg-destructive text-white hover:brightness-105",
      },
      size: {
        default: "h-10 px-4.5 text-sm",
        sm: "h-8.5 px-3.5 text-[0.8125rem]",
        lg: "h-12 px-6 text-[0.9375rem]",
        icon: "size-10",
        "icon-sm": "size-8.5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
