"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, LoaderCircle, RefreshCw } from "lucide-react";
import type { Platform } from "@social-agent/shared";
import { rescanBrandKit } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { Brand, ScanResult, SocialAccountRow } from "@/lib/types";
import { useScan } from "@/features/onboarding/use-scan";
import { ScanProgress } from "@/features/onboarding/scan-progress";
import { brandKitSchema, toPatch, toValues, type Values } from "@/features/brand-kit/schema";
import { useEditableCard } from "@/features/brand-kit/use-editable-card";
import { BusinessCard } from "@/features/brand-kit/business-card";
import { ContactDetailsCard } from "@/features/brand-kit/contact-details-card";
import { AudienceCard } from "@/features/brand-kit/audience-card";
import { VoiceCard } from "@/features/brand-kit/voice-card";
import { LooksCard } from "@/features/brand-kit/looks-card";
import { PlatformsStatusCard } from "@/features/brand-kit/platforms-status-card";
import { BrandPreview } from "@/features/brand-kit/brand-preview";
import { useLiveBrand } from "@/features/brand-kit/use-live-brand";
import { Button } from "@repo/ui/components/button";
import { Form } from "@repo/ui/components/form";

/**
 * The brand-kit step reached by stepping back mid-onboarding. The fields show right away, pre-filled
 * with what's saved now — edit them directly, or "Read my website again" to pull fresh values into
 * the same fields (a real scan screen, S02, not Settings' quiet inline banner). Either way, nothing
 * saves until "Looks right, continue" — the exact button the brand saw the first time they onboarded
 * — because clicking it is what restarts the flow: the kit is saved and connect, the questionnaire
 * and research all reset (`rescanBrandKit`), so every step runs again in order, the same as a first
 * scan, not a partial edit that quietly skips ahead on a leftover "already connected" flag.
 */
export function OnboardingBrandKitEdit({
  brand,
  accounts,
  onReset,
}: {
  brand: Brand;
  accounts: SocialAccountRow[];
  /** The just-saved brand, with connections cleared — the caller re-seeds its own copy from this. */
  onReset: (brand: Brand) => void;
}) {
  const [rescanUrl, setRescanUrl] = useState<string | null>(null);
  // Bumped on every rescan click, done or not: the form below is keyed by it, so a finished
  // rescan always remounts with fresh `defaultValues` instead of react-hook-form quietly keeping
  // what was already typed. `useScan`'s own `restart` is what actually re-runs the scan itself.
  const [rescanCount, setRescanCount] = useState(0);
  const rescan = useScan(rescanUrl);

  function startRescan() {
    setRescanUrl(brand.url);
    rescan.restart();
    setRescanCount((n) => n + 1);
  }

  if (rescan.status === "scanning") {
    return <ScanProgress url={brand.url} activeIndex={rescan.step} preview={rescan.preview} onChangeAddress={() => setRescanUrl(null)} />;
  }

  const source = rescan.status === "done" && rescan.result ? rescan.result : brand;
  return <BrandKitEditForm key={rescanCount} brand={brand} source={source} accounts={accounts} onRescan={startRescan} onSaved={onReset} />;
}

function BrandKitEditForm({
  brand,
  source,
  accounts,
  onRescan,
  onSaved,
}: {
  brand: Brand;
  /** The current saved kit, or a fresh scan's result once one has completed — either shape works with `toValues`. */
  source: Brand | ScanResult;
  accounts: SocialAccountRow[];
  onRescan: () => void;
  onSaved: (brand: Brand) => void;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(brandKitSchema),
    defaultValues: toValues(source, brand.platforms),
    mode: "onTouched",
  });
  const preview = useLiveBrand(form, source.brand);
  const { cardProps } = useEditableCard(form);
  const save = useServerAction(rescanBrandKit, {
    success: "Brand kit updated",
    failure: "Couldn't save the brand kit.",
    onSuccess: onSaved,
  });

  function togglePlatform(platform: Platform) {
    const current = form.getValues("platforms");
    const next = current.includes(platform) ? current.filter((p) => p !== platform) : [...current, platform];
    form.setValue("platforms", next, { shouldDirty: true, shouldValidate: true });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => save.run(brand.id, toPatch(values)))}
        noValidate
        className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12"
      >
        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary p-4">
            <p className="type-label">Edit anything below, or read your website again.</p>
            <Button type="button" variant="outline" size="sm" onClick={onRescan}>
              <RefreshCw aria-hidden />
              Read my website again
            </Button>
          </div>

          <BusinessCard form={form} {...cardProps("business")} />
          <ContactDetailsCard form={form} {...cardProps("contact")} />
          <AudienceCard form={form} {...cardProps("audience")} />
          <VoiceCard form={form} {...cardProps("voice")} />
          <LooksCard form={form} {...cardProps("looks")} />
          <PlatformsStatusCard form={form} brandId={brand.id} accounts={accounts} onToggle={togglePlatform} />
        </div>

        <BrandPreview brand={preview.brand} hook={preview.hook}>
          <div className="hidden lg:block">
            <Button type="submit" className="mt-6 w-fit" disabled={save.isPending}>
              {save.isPending ? <LoaderCircle className="animate-spin" /> : <Check aria-hidden />}
              {save.isPending ? "Saving your brand kit" : "Looks right, continue"}
            </Button>
            <p className="type-label mt-2.5 text-center">Starts connecting and the questionnaire over, from this.</p>
          </div>
        </BrandPreview>

        <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 border-t bg-card p-4 shadow-floating lg:hidden">
          <p className="type-label">Starts connecting and the questionnaire over.</p>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending && <LoaderCircle className="animate-spin" />}
            {save.isPending ? "Saving" : "Looks right, continue"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
