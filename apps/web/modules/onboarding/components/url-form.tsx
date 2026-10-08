"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Globe } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";
import { normalizeUrl } from "@/lib/utils";
import { routes } from "@/config/routes";

const schema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Enter the client's website to get started.")
    .refine((v) => normalizeUrl(v) !== null, "That doesn't look like a website. Try something like acme.com."),
});

/**
 * The one input the product needs. Everything else is derived from it.
 * Without an `onSubmit` the form is the start of onboarding and hands the
 * URL to that page itself.
 */
export function UrlForm({
  onSubmit,
  defaultValue = "",
  autoFocus,
  placeholder = "yourclient.com",
  submitLabel = "Read this site",
}: {
  onSubmit?: (url: string) => void;
  defaultValue?: string;
  autoFocus?: boolean;
  placeholder?: string;
  submitLabel?: string;
}) {
  const router = useRouter();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { url: defaultValue },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  function submit(url: string) {
    if (onSubmit) onSubmit(url);
    else router.push(routes.onboarding.forUrl(url));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(({ url }) => submit(normalizeUrl(url)!))} noValidate>
        <FormField
          control={form.control}
          name="url"
          render={({ field, fieldState }) => (
            <FormItem className="gap-2.5">
              <FormLabel className="sr-only">Client website</FormLabel>
              <div
                data-invalid={fieldState.invalid}
                className="flex flex-col items-stretch gap-2 rounded-[1.5rem] bg-card p-2 shadow-floating ring-1 ring-border transition-shadow focus-within:ring-2 focus-within:ring-primary data-[invalid=true]:ring-destructive sm:flex-row sm:items-center sm:gap-2 sm:rounded-full sm:p-1.5 sm:pl-5"
              >
                <div className="flex min-h-11 min-w-0 flex-1 items-center gap-2 px-2.5 sm:min-h-0 sm:px-0">
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
                      autoFocus={autoFocus}
                      placeholder={placeholder}
                      className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/70 md:text-[1.0625rem]"
                    />
                  </FormControl>
                </div>
                <Button type="submit" size="lg" className="w-full sm:w-auto">
                  <span>{submitLabel}</span>
                  <ArrowRight aria-hidden />
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
