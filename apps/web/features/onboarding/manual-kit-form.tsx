"use client";

import { useWatch, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import type { BrandKit } from "@social-agent/shared";
import { manualKitSchema, MANUAL_DEFAULT_VALUES, type ManualValues } from "@/features/onboarding/manual-kit-schema";
import { TYPEFACE_OPTIONS } from "@/features/onboarding/typeface-picker";
import { ManualBusinessCard } from "@/features/onboarding/manual-business-card";
import { ManualAudienceCard } from "@/features/onboarding/manual-audience-card";
import { ManualVoiceCard } from "@/features/onboarding/manual-voice-card";
import { ManualLooksCard } from "@/features/onboarding/manual-looks-card";
import { ManualContactCard } from "@/features/onboarding/manual-contact-card";
import { ManualPlatformsCard } from "@/features/onboarding/manual-platforms-card";
import { NeededChecklist } from "@/features/onboarding/needed-checklist";
import { BrandPreview } from "@/features/brand-kit/brand-preview";
import { brandStyle, isValidHex } from "@/lib/utils";
import { Button } from "@repo/ui/components/button";
import { Form } from "@repo/ui/components/form";

const REQUIRED_FIELDS = [
  { field: "name", label: "Business name" },
  { field: "summary", label: "What you do" },
  { field: "audience", label: "Who it's for" },
  { field: "platforms", label: "Where to post" },
] as const;

function isFilled(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return Boolean(value);
}

function fontsFor(typeface: ManualValues["typeface"]) {
  const option = TYPEFACE_OPTIONS.find((t) => t.id === typeface) ?? TYPEFACE_OPTIONS[0];
  return { heading: option.heading, body: option.body };
}

/** FL-1: the short form that stands in for a scan when there's no site to read. Two columns: the
 * kit on the left, a live "post in your brand" preview and the required-fields checklist on the right. */
export function ManualKitForm({ onContinue }: { onContinue: (values: ManualValues) => void }) {
  const form = useForm<ManualValues>({
    resolver: zodResolver(manualKitSchema),
    defaultValues: MANUAL_DEFAULT_VALUES,
    mode: "onTouched",
  });
  const live = useWatch({ control: form.control });
  const liveColors = (live.colors ?? []).filter((c): c is { name: string; hex: string } => !!c?.hex && isValidHex(c.hex));
  const previewBrand: BrandKit = {
    tagline: live.tagline ?? "",
    summary: live.summary ?? "",
    audience: live.audience ?? "",
    voice: live.voice ?? [],
    colors: liveColors.length ? liveColors : MANUAL_DEFAULT_VALUES.colors,
    fonts: fontsFor(live.typeface ?? "clean"),
  };
  const checklistItems = REQUIRED_FIELDS.map((item) => ({ label: item.label, done: isFilled(live[item.field]) }));
  const allDone = checklistItems.every((item) => item.done);

  return (
    <div className="brand-scope" style={brandStyle(previewBrand.colors[0]!.hex)}>
      <div className="mb-8 max-w-[40rem]">
        <h1 className="type-title">Tell us about your business</h1>
        <p className="mt-2 text-muted-foreground">
          Every post starts from this brand kit. About five minutes, and you can change all of it later.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onContinue)} noValidate className="grid gap-8 pb-20 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12 lg:pb-0">
          <div className="grid gap-4">
            <ManualBusinessCard form={form} />
            <ManualAudienceCard form={form} />
            <ManualVoiceCard form={form} />
            <ManualLooksCard form={form} />
            <ManualContactCard form={form} />
            <ManualPlatformsCard form={form} />
          </div>

          <BrandPreview brand={previewBrand} hook={live.tagline || "Your headline here"}>
            <div className="hidden lg:block">
              <NeededChecklist items={checklistItems} allDone={allDone} />
            </div>
          </BrandPreview>

          <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 border-t bg-card p-4 shadow-floating lg:hidden">
            <p className="type-label">
              {checklistItems.filter((i) => i.done).length} of {checklistItems.length} needed parts done
            </p>
            <Button type="submit" size="lg" disabled={!allDone}>
              Continue
              <ArrowRight aria-hidden />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
