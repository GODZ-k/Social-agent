"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import type { Platform } from "@social-agent/shared";
import { createBrandForClient, createClient } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { NewClientInput, ScanResult } from "@/lib/types";
import { brandStyle } from "@/lib/utils";
import { brandKitSchema, toInput, toValues, type Values } from "@/features/brand-kit/schema";
import { useEditableCard } from "@/features/brand-kit/use-editable-card";
import { BusinessCard } from "@/features/brand-kit/business-card";
import { AudienceCard } from "@/features/brand-kit/audience-card";
import { VoiceCard } from "@/features/brand-kit/voice-card";
import { LooksCard } from "@/features/brand-kit/looks-card";
import { PlatformsCard } from "@/features/brand-kit/platforms-card";
import { BrandPreview } from "@/features/brand-kit/brand-preview";
import { useLiveBrand } from "@/features/brand-kit/use-live-brand";
import { Button } from "@repo/ui/components/button";
import { Form } from "@repo/ui/components/form";

/**
 * Onboarding's review step (S17a): each card is read-only until Edit is tapped, then Cancel/Done
 * swap it back. `personId` set means an admin is building this brand for that client (2026-09-28):
 * the brand is created under them, and the flow continues under `/admin/c/:personId/brand/new`.
 */
export function OnboardingBrandKitForm({
  url,
  scan,
  personId,
  heading = "Here's what we found",
  description = "Your brand kit: your colours, fonts and how you sound. Every post starts from it, so fix anything that isn't right.",
}: {
  url: string;
  scan: ScanResult;
  personId?: string;
  /** FL-1 (manual entry) shows its own copy here instead of the scan's "here's what we found". */
  heading?: string;
  description?: string;
}) {
  const router = useRouter();
  // Platforms the scan found linked on the site start ticked; the owner can still change any of them.
  const signalPlatforms = Object.keys(scan.platformSignals ?? {}) as Platform[];
  const foundPlatforms: Platform[] = signalPlatforms.length ? signalPlatforms : ["instagram"];
  const form = useForm<Values>({
    resolver: zodResolver(brandKitSchema),
    defaultValues: toValues(scan, foundPlatforms),
    mode: "onTouched",
  });
  const preview = useLiveBrand(form, scan.brand);
  const { cardProps } = useEditableCard(form);
  const createBrand = personId ? (input: NewClientInput) => createBrandForClient(personId, input) : createClient;
  const save = useServerAction(createBrand, {
    success: (client) => `${client.name} added`,
    failure: "Couldn't save the brand.",
    onSuccess: (client) =>
      router.push(personId ? `/admin/c/${personId}/brand/new?brandId=${client.id}` : `/onboarding?clientId=${client.id}`),
  });

  return (
    <div className="brand-scope" style={brandStyle(preview.brand.colors[0]!.hex)}>
      <div className="mb-8 max-w-[40rem]">
        <h1 className="type-title">{heading}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => save.run(toInput(values, url)))}
          noValidate
          className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12"
        >
          <div className="grid gap-4">
            <BusinessCard form={form} sources={scan.sources} {...cardProps("business")} />
            <AudienceCard form={form} sources={scan.sources} {...cardProps("audience")} />
            <VoiceCard form={form} {...cardProps("voice")} />
            <LooksCard form={form} sources={scan.sources} {...cardProps("looks")} />
            <PlatformsCard
              form={form}
              title="Where should we post?"
              hint="Your plan is made for these. You connect them in the next step."
              signals={scan.platformSignals}
            />
          </div>

          <BrandPreview brand={preview.brand} hook={preview.hook}>
            <div className="hidden lg:block">
              <Button type="submit" size="lg" className="mt-6 w-full" disabled={save.isPending}>
                {save.isPending && <LoaderCircle className="animate-spin" />}
                {save.isPending ? "Saving your brand kit" : "Looks right, continue"}
              </Button>
              <p className="type-label mt-2.5 text-center">You can change all of this later in Settings.</p>
            </div>
          </BrandPreview>

          <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 border-t bg-card p-4 shadow-floating lg:hidden">
            <p className="type-label">You can change all of this later in Settings.</p>
            <Button type="submit" size="lg" disabled={save.isPending}>
              {save.isPending && <LoaderCircle className="animate-spin" />}
              {save.isPending ? "Saving" : "Looks right, continue"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
