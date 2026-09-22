"use client";

import type { UseFormReturn } from "react-hook-form";
import { normalizeHashtag } from "@/lib/image";
import { Input, Textarea } from "@repo/ui/components/input";
import { TagInput } from "@repo/ui/components/tag-input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";
import { CAPTION_LIMIT, HASHTAG_LIMIT, type Values } from "./schema";

/** `children` is the schedule fields, present while the post can still be moved. */
export function PostForm({
  form,
  locked,
  mediaUrl,
  onSubmit,
  children,
}: {
  form: UseFormReturn<Values>;
  /** A published post is read-only. */
  locked: boolean;
  mediaUrl: string | null;
  onSubmit: (values: Values) => void;
  children?: React.ReactNode;
}) {
  return (
    <Form {...form}>
      <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset disabled={locked} className="grid gap-5 disabled:opacity-70">
          <FormField control={form.control} name="hook" render={({ field }) => (
            <FormItem>
              <FormLabel>Headline on the image</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              {mediaUrl && <FormDescription>Shown only on generated artwork. Your own image is used as it is.</FormDescription>}
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="caption" render={({ field }) => (
            <FormItem>
              <div className="flex items-baseline justify-between">
                <FormLabel>Caption</FormLabel>
                <span className="type-label tabular-nums">{field.value.length} / {CAPTION_LIMIT}</span>
              </div>
              <FormControl><Textarea rows={6} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="hashtags" render={({ field }) => (
            <FormItem>
              <div className="flex items-baseline justify-between">
                <FormLabel>Hashtags</FormLabel>
                <span className="type-label tabular-nums">{field.value.length} / {HASHTAG_LIMIT}</span>
              </div>
              <FormControl>
                <TagInput
                  value={field.value}
                  onChange={field.onChange}
                  normalize={normalizeHashtag}
                  max={HASHTAG_LIMIT}
                  disabled={locked}
                  placeholder="Type a hashtag and press Enter"
                />
              </FormControl>
              <FormDescription>Added after the caption when the post is published.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
          {children}
        </fieldset>
        {/* Lets Enter submit from the single-line fields. */}
        <button type="submit" hidden />
      </form>
    </Form>
  );
}
