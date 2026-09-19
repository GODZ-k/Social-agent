"use client";

import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle, Plus, X } from "lucide-react";
import type { BrandKit, NewClientInput, Platform } from "@/lib/types";
import { brandStyle, cn, isValidHex } from "@/lib/utils";
import { Button } from "@repo/ui/components/button";
import { Input, Textarea } from "@repo/ui/components/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";
import { PLATFORM_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";
import { PostArt } from "@repo/ui/components/social/post-art";

const PLATFORMS = ["instagram", "facebook", "tiktok", "linkedin"] as const satisfies readonly Platform[];
const VOICE_SUGGESTIONS = ["Friendly", "Straightforward", "Confident", "Playful", "Expert", "Warm", "Witty", "Calm", "Bold"];

const schema = z.object({
  name: z.string().trim().min(1, "Give the business a name."),
  industry: z.string().trim().min(1, "Say what kind of business this is."),
  tagline: z.string().trim().max(120, "Keep the tagline under 120 characters."),
  summary: z.string().trim().min(20, "Add a sentence or two so the agent knows what they sell."),
  audience: z.string().trim().min(1, "Describe who the posts are for."),
  voice: z.array(z.string()).min(1, "Pick at least one word for how they sound."),
  colors: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Name this colour."),
        hex: z.string().refine(isValidHex, "Use a hex colour, like #2F6FDE."),
      }),
    )
    .min(1, "Keep at least one brand colour."),
  headingFont: z.string().trim().min(1, "Name the heading typeface."),
  bodyFont: z.string().trim().min(1, "Name the body typeface."),
  platforms: z.array(z.enum(PLATFORMS)).min(1, "Choose at least one place to publish."),
});

type Values = z.infer<typeof schema>;

/**
 * The brand kit editor. Onboarding uses it to review what the agent found;
 * Settings uses the same form to change it later.
 */
export function BrandKitForm({
  url,
  scan,
  initialPlatforms = ["instagram"],
  variant = "onboarding",
  isSaving,
  onSubmit,
}: {
  url: string;
  scan: { name: string; industry: string; brand: BrandKit };
  initialPlatforms?: Platform[];
  variant?: "onboarding" | "settings";
  isSaving: boolean;
  onSubmit: (input: NewClientInput) => void;
}) {
  const editing = variant === "settings";
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: scan.name,
      industry: scan.industry,
      tagline: scan.brand.tagline,
      summary: scan.brand.summary,
      audience: scan.brand.audience,
      voice: scan.brand.voice,
      colors: scan.brand.colors,
      headingFont: scan.brand.fonts.heading,
      bodyFont: scan.brand.fonts.body,
      platforms: initialPlatforms.filter((p): p is (typeof PLATFORMS)[number] => (PLATFORMS as readonly string[]).includes(p)),
    },
    mode: "onTouched",
  });
  const colors = useFieldArray({ control: form.control, name: "colors" });

  // The preview and the page tint follow the form as it's edited.
  const live = useWatch({ control: form.control });
  const liveColors = (live.colors ?? []).filter((c): c is { name: string; hex: string } => !!c?.hex && isValidHex(c.hex));
  const previewBrand: BrandKit = { ...scan.brand, colors: liveColors.length ? liveColors : scan.brand.colors };

  function submit(v: Values) {
    onSubmit({
      name: v.name,
      url,
      industry: v.industry,
      platforms: v.platforms,
      brand: {
        tagline: v.tagline,
        summary: v.summary,
        audience: v.audience,
        voice: v.voice,
        colors: v.colors,
        fonts: { heading: v.headingFont, body: v.bodyFont },
      },
    });
  }

  return (
    <div className="brand-scope" style={brandStyle(previewBrand.colors[0]!.hex)}>
      {!editing && (
        <div className="mb-8 max-w-[60ch]">
          <h1 className="type-title">Here&apos;s what the agent found</h1>
          <p className="mt-2 text-muted-foreground">
            Every post it writes starts from this. Correct anything that&apos;s off before it plans the strategy.
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} noValidate className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
          <div className="grid gap-9">
            <Group title="The business">
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Business name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="industry" render={({ field }) => (
                  <FormItem><FormLabel>Type of business</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="tagline" render={({ field }) => (
                <FormItem><FormLabel>Tagline</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="summary" render={({ field }) => (
                <FormItem><FormLabel>What they do</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="audience" render={({ field }) => (
                <FormItem><FormLabel>Who it&apos;s for</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </Group>

            <Group title="How they sound">
              <FormField control={form.control} name="voice" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tone of voice</FormLabel>
                  <VoicePicker value={field.value} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )} />
            </Group>

            <Group title="How they look">
              <div className="grid gap-2.5">
                <FormLabelPlain>Brand colours</FormLabelPlain>
                <p className="type-label -mt-1">The first colour becomes the workspace accent.</p>
                <ul className="grid gap-2.5">
                  {colors.fields.map((item, i) => (
                    <li key={item.id} className="grid grid-cols-[auto_minmax(0,1fr)_7.5rem_auto] items-start gap-2.5">
                      <FormField control={form.control} name={`colors.${i}.hex`} render={({ field }) => (
                        <label className="relative size-11 shrink-0 cursor-pointer overflow-hidden rounded-md ring-1 ring-border" style={{ background: isValidHex(field.value) ? field.value : "transparent" }}>
                          <span className="sr-only">Pick colour {i + 1}</span>
                          <input type="color" value={isValidHex(field.value) && field.value.length === 7 ? field.value : "#000000"} onChange={(e) => field.onChange(e.target.value.toUpperCase())} className="absolute inset-0 size-full cursor-pointer opacity-0" />
                        </label>
                      )} />
                      <FormField control={form.control} name={`colors.${i}.name`} render={({ field }) => (
                        <FormItem><FormControl><Input aria-label={`Colour ${i + 1} name`} {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`colors.${i}.hex`} render={({ field }) => (
                        <FormItem><FormControl><Input aria-label={`Colour ${i + 1} hex value`} className="font-medium uppercase tabular-nums" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="button" variant="ghost" size="icon" aria-label={`Remove colour ${i + 1}`} disabled={colors.fields.length <= 1} onClick={() => colors.remove(i)}>
                        <X />
                      </Button>
                    </li>
                  ))}
                </ul>
                {colors.fields.length < 6 && (
                  <Button type="button" variant="secondary" size="sm" className="w-fit" onClick={() => colors.append({ name: "New colour", hex: "#888888" })}>
                    <Plus /> Add a colour
                  </Button>
                )}
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField control={form.control} name="headingFont" render={({ field }) => (
                  <FormItem><FormLabel>Heading typeface</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="bodyFont" render={({ field }) => (
                  <FormItem><FormLabel>Body typeface</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </Group>

            <Group title="Where to publish">
              <FormField control={form.control} name="platforms" render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {PLATFORMS.map((p) => {
                      const on = field.value.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          role="checkbox"
                          aria-checked={on}
                          onClick={() => field.onChange(on ? field.value.filter((x) => x !== p) : [...field.value, p])}
                          className={cn(
                            "pressable flex flex-col items-start gap-3 rounded-lg p-3.5 text-left text-sm font-medium ring-1",
                            on ? "bg-tint text-tint-foreground ring-primary" : "bg-card text-muted-foreground ring-border hover:text-foreground",
                          )}
                        >
                          <PlatformIcon platform={p} className="size-5" />
                          {PLATFORM_LABEL[p]}
                        </button>
                      );
                    })}
                  </div>
                  <FormDescription>
                    {editing
                      ? "The strategy plans posts for these. Connect each one under Social accounts so it can publish."
                      : "You'll connect the accounts after the strategy is ready."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </Group>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="type-label mb-2.5">A post in this brand</p>
            <PostArt
              brand={previewBrand}
              post={{ hook: live.tagline || "Your headline here", format: "carousel", art: { variant: 0, colorIndex: 0 } }}
              className="max-w-64 shadow-floating lg:max-w-none"
            />
            {/* When editing, the button wakes up only once something has changed. */}
            <Button type="submit" size="lg" className="mt-6 w-full" disabled={isSaving || (editing && !form.formState.isDirty)}>
              {isSaving && <LoaderCircle className="animate-spin" />}
              {editing ? (isSaving ? "Saving changes" : "Save changes") : isSaving ? "Saving the brand kit" : "Save and plan the strategy"}
            </Button>
            {editing && <p className="type-label mt-2.5 text-center">New posts use the updated kit. Posts already drafted keep their wording.</p>}
          </aside>
        </form>
      </Form>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-5">
      <legend className="type-heading mb-4">{title}</legend>
      {children}
    </fieldset>
  );
}

function FormLabelPlain({ children }: { children: React.ReactNode }) {
  return <p className="text-[0.8125rem] font-medium leading-none">{children}</p>;
}

function VoicePicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const options = [...new Set([...value, ...VOICE_SUGGESTIONS])];

  function addDraft() {
    const word = draft.trim();
    if (word && !value.some((v) => v.toLowerCase() === word.toLowerCase())) onChange([...value, word]);
    setDraft("");
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((word) => {
        const on = value.includes(word);
        return (
          <button
            key={word}
            type="button"
            role="checkbox"
            aria-checked={on}
            onClick={() => onChange(on ? value.filter((v) => v !== word) : [...value, word])}
            className={cn(
              "pressable rounded-full px-3.5 py-1.5 text-sm font-medium ring-1",
              on ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-muted-foreground ring-border hover:text-foreground",
            )}
          >
            {word}
          </button>
        );
      })}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addDraft();
          }
        }}
        onBlur={addDraft}
        placeholder="Add your own"
        aria-label="Add your own tone word"
        className="h-[2.125rem] w-32 rounded-full bg-transparent px-3.5 text-sm ring-1 ring-border outline-none ring-inset placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary"
      />
    </div>
  );
}
