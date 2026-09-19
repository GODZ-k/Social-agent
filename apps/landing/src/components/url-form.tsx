"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Globe } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";
import { normalizeUrl, signUpUrl } from "@/lib/site";

const schema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Enter your website to get started.")
    .refine((v) => normalizeUrl(v) !== null, "That doesn't look like a website. Try something like acme.com."),
});

/**
 * The same field the product opens with. Here it hands the address to sign-up,
 * so the agent can start reading the site as soon as the visitor has an account.
 */
export function UrlForm({ className }: { className?: string }) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { url: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  return (
    <Form {...form}>
      <form
        className={className}
        onSubmit={form.handleSubmit(({ url }) => window.location.assign(signUpUrl(normalizeUrl(url)!)))}
        noValidate
      >
        <FormField
          control={form.control}
          name="url"
          render={({ field, fieldState }) => (
            <FormItem className="gap-2.5">
              <FormLabel className="sr-only">Your website</FormLabel>
              <div
                data-invalid={fieldState.invalid}
                className="flex items-center gap-2 rounded-full bg-card p-1.5 pl-5 shadow-floating ring-1 ring-border transition-shadow focus-within:ring-2 focus-within:ring-primary data-[invalid=true]:ring-destructive"
              >
                <Globe className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                <FormControl>
                  <input
                    {...field}
                    type="text"
                    inputMode="url"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    autoComplete="url"
                    placeholder="yourbusiness.com"
                    className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/70 md:text-[1.0625rem]"
                  />
                </FormControl>
                <Button type="submit" size="lg" className="max-sm:size-12 max-sm:px-0">
                  <span className="max-sm:sr-only">Read my site</span>
                  <ArrowRight className="sm:hidden" />
                </Button>
              </div>
              <FormMessage className="pl-5" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
