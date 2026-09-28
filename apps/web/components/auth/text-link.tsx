import Link from "next/link";
import { cn } from "@/lib/utils";

export const textLinkClass =
  "font-medium text-tint-foreground underline decoration-tint-foreground/35 underline-offset-3 hover:decoration-tint-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function TextLink({ className, ...props }: React.ComponentProps<typeof Link>) {
  return <Link className={cn(textLinkClass, className)} {...props} />;
}
