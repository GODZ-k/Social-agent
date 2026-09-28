"use client";

import { useState } from "react";
import { format, isValid } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, LoaderCircle, Pencil, RefreshCw } from "lucide-react";
import type { Platform } from "@social-agent/shared";
import { updateClient } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import { useScan } from "@/features/onboarding/use-scan";
import type { Client, SocialAccountRow } from "@/lib/types";
import { brandStyle, prettyUrl } from "@/lib/utils";
import { brandKitSchema, toValues, toPatch, type Values } from "@/features/brand-kit/schema";
import { useEditableCard, type CardKey } from "@/features/brand-kit/use-editable-card";
import type { CardControls } from "@/features/brand-kit/editable-card";
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

/** Settings (S13): each section is its own read-only card until Edit is tapped; Done validates and saves the whole kit. */
export function SettingsBrandKitForm({ client, accounts }: { client: Client; accounts: SocialAccountRow[] }) {
  const form = useForm<Values>({
    resolver: zodResolver(brandKitSchema),
    defaultValues: toValues(client, client.platforms),
    mode: "onTouched",
  });
  const preview = useLiveBrand(form, client.brand);
  const { cardProps } = useEditableCard(form);
  // Guards a stale dev-server mock DB (globalThis-cached; see lib/api/mock/db.ts) whose
  // in-memory clients may predate these fields, rather than crashing date-fns' `format`.
  const scannedAt = new Date(client.kitScannedAt);
  const editedAt = new Date(client.kitEditedAt);
  // "Read my website again" (S13): a fresh scan, applied only to fields the owner hasn't edited.
  const [rescanUrl, setRescanUrl] = useState<string | null>(null);
  const rescan = useScan(rescanUrl);
  const scanning = rescan.status === "scanning";
  const save = useServerAction(updateClient, {
    success: "Changes saved",
    failure: "Couldn't save those changes.",
    // The saved values become the new baseline, so a later Cancel restores what was just saved.
    onSuccess: (saved) => {
      const values = toValues(saved, saved.platforms);
      form.reset(values);
    },
  });

  // A card's Done validates its fields, saves the whole kit, then closes the card.
  function cardPropsWithSave(card: CardKey): CardControls {
    const controls = cardProps(card);
    return {
      ...controls,
      onDone: () => {
        form.handleSubmit((values) => {
          const patch = toPatch(values);
          save.run(client.id, patch);
          controls.onDone();
        })();
      },
    };
  }

  // "Where to post" has no Edit step (S13): a tap changes the plan and saves right away.
  function togglePlatform(platform: Platform) {
    const current = form.getValues("platforms");
    const next = current.includes(platform) ? current.filter((p) => p !== platform) : [...current, platform];
    form.setValue("platforms", next, { shouldDirty: true, shouldValidate: true });
    const patch = toPatch({ ...form.getValues(), platforms: next });
    save.run(client.id, patch);
  }

  function applyRescan() {
    if (!rescan.result) return;
    const current = form.getValues();
    const fresh = toValues(rescan.result, current.platforms);
    const dirty = form.formState.dirtyFields as Record<string, unknown>;
    const merged = Object.fromEntries(
      Object.entries(fresh).map(([key, value]) => [key, dirty[key] ? current[key as keyof Values] : value]),
    ) as Values;
    form.reset(merged, { keepDirty: true });
    setRescanUrl(null);
  }

  return (
    <div className="brand-scope" style={brandStyle(preview.brand.colors[0]!.hex)}>
      <Form {...form}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary p-4">
              <p className="type-label">Read from {prettyUrl(client.url)}. Edits you make here are always kept.</p>
              <Button type="button" variant="outline" size="sm" disabled={scanning} onClick={() => setRescanUrl(client.url)}>
                {scanning ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}
                {scanning ? "Reading your website" : "Read my website again"}
              </Button>
            </div>
            {rescan.status === "done" && rescan.result && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-tint p-4">
                <p className="type-label !text-tint-foreground">Found fresh details. Fields you&apos;ve edited keep your wording.</p>
                <Button type="button" variant="tint" size="sm" onClick={applyRescan}>
                  Use these
                </Button>
              </div>
            )}
            {rescan.status === "error" && rescan.error && <p className="type-label text-destructive">{rescan.error}</p>}

            <BusinessCard form={form} {...cardPropsWithSave("business")} />
            <ContactDetailsCard form={form} {...cardPropsWithSave("contact")} />
            <AudienceCard form={form} {...cardPropsWithSave("audience")} />
            <VoiceCard form={form} {...cardPropsWithSave("voice")} />
            <LooksCard form={form} {...cardPropsWithSave("looks")} />
            <PlatformsStatusCard form={form} brandId={client.id} accounts={accounts} onToggle={togglePlatform} />
          </div>

          <BrandPreview brand={preview.brand} hook={preview.hook}>
            <div className="mt-3 grid gap-1.5 rounded-xl bg-secondary/60 p-4 text-[0.8125rem] leading-relaxed">
              <p className="flex items-start gap-2">
                <Globe className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <span>
                  {isValid(scannedAt) && isValid(editedAt)
                    ? `Read from ${prettyUrl(client.url)} on ${format(scannedAt, "d MMM")}. You last edited it on ${format(editedAt, "d MMM")}.`
                    : `Read from ${prettyUrl(client.url)}. Edits you make here are always kept.`}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <Pencil className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <span>Edits apply to posts written from now on. Posts already drafted keep their wording.</span>
              </p>
            </div>
          </BrandPreview>
        </div>
      </Form>
    </div>
  );
}
