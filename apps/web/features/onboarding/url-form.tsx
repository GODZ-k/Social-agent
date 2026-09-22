"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Globe } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";
import { normalizeUrl } from "@/lib/utils";

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
}: {
  onSubmit?: (url: string) => void;
  defaultValue?: string;
  autoFocus?: boolean;
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
    else router.push(`/onboarding?url=${encodeURIComponent(url)}`);
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
                    autoFocus={autoFocus}
                    placeholder="yourclient.com"
                    className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/70 md:text-[1.0625rem]"
                  />
                </FormControl>
                <Button type="submit" size="lg" className="max-sm:size-12 max-sm:px-0">
                  <span className="max-sm:sr-only">Read this site</span>
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
