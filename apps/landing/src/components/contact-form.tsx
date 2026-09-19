"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";
import { Input, Textarea } from "@repo/ui/components/input";
import { company } from "@/lib/content/company";
import { normalizeUrl } from "@/lib/site";

const schema = z.object({
  name: z.string().trim().min(1, "Enter your name."),
  email: z.email("Enter an email address like name@business.com."),
  website: z
    .string()
    .trim()
    .refine((v) => v === "" || normalizeUrl(v) !== null, "That doesn't look like a website. Try something like acme.com."),
  message: z.string().trim().min(10, "Tell us a little more. A sentence or two is enough."),
});
type ContactMessage = z.infer<typeof schema>;

/**
 * The seam for a real endpoint. There is no backend for the site yet, so this
 * only waits; replace the body with a request to the API and keep the signature.
 */
async function sendContactMessage(message: ContactMessage): Promise<void> {
  void message;
  await new Promise((resolve) => setTimeout(resolve, 600));
}

export function ContactForm() {
  const form = useForm<ContactMessage>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", website: "", message: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { isDirty, isSubmitting } = form.formState;

  async function onSubmit(values: ContactMessage) {
    try {
      await sendContactMessage(values);
      toast("Sent");
      form.reset();
    } catch {
      toast(`That didn't send. Try again, or email ${company.email}.`);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your name</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your website, if you have one</FormLabel>
              <FormControl>
                <Input inputMode="url" autoCapitalize="none" spellCheck={false} placeholder="yourbusiness.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How can we help?</FormLabel>
              <FormControl>
                <Textarea rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting && <LoaderCircle className="animate-spin" />}
            Send message
          </Button>
        </div>
      </form>
    </Form>
  );
}
