import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium [&>svg]:size-3",
  {
    variants: {
      variant: {
        neutral: "bg-secondary text-secondary-foreground",
        tint: "bg-tint text-tint-foreground",
        success: "bg-success/12 text-success",
        warning: "bg-warning/14 text-warning",
        danger: "bg-destructive/12 text-destructive",
        outline: "border text-muted-foreground",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
